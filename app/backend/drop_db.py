import asyncio
from deps import _client, DB_NAME

async def main():
    print(f"Dropping database: {DB_NAME}")
    await _client.drop_database(DB_NAME)
    print("Done dropping database.")

if __name__ == "__main__":
    asyncio.run(main())
