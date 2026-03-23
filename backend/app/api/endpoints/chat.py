from fastapi import APIRouter, Depends
from app.schemas.chat import ChatRequest, ChatResponse
from app.agent.orchestrator import get_agent_response
from fastapi.responses import StreamingResponse
from app.agent.callbacks import StreamingCallbackHandler
import asyncio
import json

from app.core.security import get_current_user, VerifiedUser

router = APIRouter()

@router.post("/chat/stream")
async def chat_stream(
    chat_request: ChatRequest,
    user: VerifiedUser = Depends(get_current_user) 
):
    queue = asyncio.Queue()
    callback = StreamingCallbackHandler(queue=queue)

    async def agent_task():
        try:
            result_output = await get_agent_response(
                user_input=chat_request.message,
                user_email=user.email,
                access_token=chat_request.access_token,
                config={"callbacks": [callback]}
            )
            
            # This is the SOLE place that emits the final response.
            # get_agent_response always returns a string (with fallback logic),
            # and on_agent_finish in callbacks.py is intentionally disabled.
            if result_output:
                chunk = f"event: final_chunk\ndata: {json.dumps({'output': result_output})}\n\n"
                await queue.put(chunk)
                
        except Exception as e:
            error_message = f"event: final_chunk\ndata: {json.dumps({'output': f'An unexpected streaming error occurred: {e}'})}\n\n"
            await queue.put(error_message)
        finally:
            await queue.put("event: end\ndata: {}\n\n")

    asyncio.create_task(agent_task())
    
    async def stream_generator():
        while True:
            data = await queue.get()
            yield data
            if data == "event: end\ndata: {}\n\n":
                break
    
    return StreamingResponse(stream_generator(), media_type="text/event-stream")