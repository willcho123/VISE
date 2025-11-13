# Card restrictions

# Classic - should register without restrictions
POST {{host}}/client
{
  "name": "Alice Classic",
  "country": "USA",
  "monthlyIncome": 100,
  "viseClub": false,
  "cardType": "Classic"
}
HTTP 200
[Captures]
classic_id: jsonpath "$['clientId']"
[Asserts]
jsonpath "$.status" == "Registered"
jsonpath "$.cardType" == "Classic"


