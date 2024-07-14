import sys
from typing import Annotated, Sequence, TypedDict, Dict, Optional,List, Any,TypedDict,Literal
from enum import Enum
from datetime import datetime
from pydantic import BaseModel,Field


sys.path.append('./')

#create an enum for job_type, with [sft,pt]

class JobType(Enum):
    sft = 'sft'
    pt = 'pt'
    ppo = 'ppo'
    dpo = 'dpo'
    kto = 'kto'
    rm = 'rm'
    
class JobStatus(Enum):
    PENDING = "PENDING"
    SUBMITTED = "SUBMITTED"
    CREATING = "CREATING"
    RUNNING = "RUNNING"
    SUCCESS = "SUCCESS"
    ERROR = "ERROR"
    TERMINATED = "TERMINATED"
    TERMINATING = "TERMINATING"
    STOPPED = "STOPPED"
    
class FetchLogRequest(BaseModel):
    job_run_name:str
    
class FetchLogResponse(BaseModel):
    response_id:str
    log_events:List[str]
    
class CreateJobsRequest(BaseModel):
    request_id:Optional[str]
    # job_type : Literal["sft","pt"] = Field(default="sft")
    job_type : JobType  = Field(default=JobType.sft)
    job_name: str
    job_payload: Dict[str,Any]
    
class JobInfo(BaseModel):
    job_id:str
    job_name: str
    job_run_name:str
    output_s3_path: str
    job_type : JobType 
    job_status : JobStatus 
    job_payload : Dict[str,Any]
    job_create_time: Optional[datetime] = None 
    job_start_time:Optional[datetime] = None
    job_end_time:Optional[datetime] = None 
    ts:int

class JobStatusResponse(BaseModel):
    response_id:str
    job_status:JobStatus
    
class ListJobsRequest(BaseModel):
    page_size : int = 20
    page_index : Optional[int] = Field(default=1)
    query_terms : Optional[Dict[str,Any]] =  Field(default=None)
    
class GetJobsRequest(BaseModel):
    job_id:str
    
class DelJobsRequest(BaseModel):
    job_id:str

class JobsResponse(BaseModel):
    response_id:str
    body:JobInfo

class ListJobsResponse(BaseModel):
    response_id:str
    jobs :List[JobInfo]
    total_count:int
    
class CommonResponse(BaseModel):
    response_id:str
    response:Dict[str,Any]
    
class GetFactoryConfigRequest(BaseModel):
    config_name:Literal["model_name","prompt_template","dataset"] 
    
class ListModelNamesResponse(BaseModel):
    response_id:str
    model_names:List[str]
    
class ListS3ObjectsRequest(BaseModel):
    output_s3_path:str
    
class S3ObjectsResponse(BaseModel):
    response_id:str
    objects:List[Dict[str,Any]]

    