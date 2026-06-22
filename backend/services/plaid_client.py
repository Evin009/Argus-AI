import os

from dotenv import load_dotenv
from plaid.api import plaid_api
from plaid.api_client import ApiClient
from plaid.configuration import Configuration
from plaid.model.country_code import CountryCode
from plaid.model.products import Products

load_dotenv()

_PLAID_ENV_MAP = {
    "sandbox": "https://sandbox.plaid.com",
    "development": "https://development.plaid.com",
    "production": "https://production.plaid.com",
}

PLAID_PRODUCTS = [Products("transactions"), Products("liabilities")]
PLAID_COUNTRY_CODES = [CountryCode("US")]


def get_plaid_client() -> plaid_api.PlaidApi:
    env = os.environ.get("PLAID_ENV", "sandbox")
    configuration = Configuration(
        host=_PLAID_ENV_MAP[env],
        api_key={
            "clientId": os.environ["PLAID_CLIENT_ID"],
            "secret": os.environ["PLAID_SECRET"],
        },
    )
    api_client = ApiClient(configuration)
    return plaid_api.PlaidApi(api_client)
