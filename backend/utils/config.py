import dotenv
import boto3
import os
import sagemaker

dotenv.load_dotenv()
print(os.environ)
QLORA_BASE_CONFIG = './LLaMA-Factory/examples/train_qlora/llama3_lora_sft_bitsandbytes.yaml'
LORA_BASE_CONFIG = './LLaMA-Factory/examples/train_lora/llama3_lora_sft.yaml'
FULL_BASE_CONFIG = './LLaMA-Factory/examples/train_full/llama3_full_sft_ds3.yaml'
DATASET_INFO_FILE = './LLaMA-Factory/data/dataset_info.json'


# HuggingFace Accelerate, use "scheduler" if deploying a text-generation model, and "disable" for other tasks (can also the config omit entirely)
DEFAULT_ENGINE='vllm'#'scheduler'
DEFAULT_REGION = os.environ.get('region')
if os.environ.get('profile'):
    boto_sess = boto3.Session(
        profile_name=os.environ.get('profile'),
        aws_access_key_id=os.environ['AK'],
        aws_secret_access_key=os.environ['SK'],
        region_name=DEFAULT_REGION
    )
else :
    boto_sess = boto3.Session(
         aws_access_key_id=os.environ['AK'],
        aws_secret_access_key=os.environ['SK'],
        region_name=DEFAULT_REGION
    )
    
# print(f"region:{boto_sess.region_name}")

# default_role  = sagemaker.get_execution_role()
# print(f"default_role:{default_role}")

# role = os.environ.get('role') if os.environ.get('role') else default_role
role = os.environ.get('role')
print(f"sagemaker role:{role}")


sagemaker_session =  sagemaker.session.Session(boto_session=boto_sess) #sagemaker.session.Session()
region = sagemaker_session.boto_region_name
default_bucket = sagemaker_session.default_bucket()
print(f"default_bucket:{default_bucket}")
MYSQL_CONFIG = {
    'host': os.environ['db_host'],
    'user': os.environ['db_user'],
    'password': os.environ['db_password'],
    'database': os.environ['db_name']
}
JOB_TABLE = "JOB_TABLE"
EP_TABLE = 'EP_TABLE'
USER_TABLE= 'USER_TABLE'
DEEPSPEED_BASE_CONFIG_MAP = { "stage_2":'examples/deepspeed/ds_z2_config.json',
                             "stage_3":'examples/deepspeed/ds_z3_config.json'}




