
class Message:
    def __init__(self, connection, json):
        self.connection = connection

        self.data     = json.get('data', None)
        self.uuid     = json.get('uuid', None)
        self.provider = json.get('provider', None)
    async def answer (self, data: any):
        await self.connection.answer(self.uuid, data)
