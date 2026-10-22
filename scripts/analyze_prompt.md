## CONTEXT
You will build a script that loads and reads an .csv file that will detect and count invalid records and print a summary on the console.
it should accept the path as a command line argument python analyze.py incidents-trackflow.csv



## CSV FILE STRUCTURE
Field	Type	Required	Allowed values / format
incident_id	string	✅	Unique ID, format TRF-XXXXXX (e.g. TRF-000001)
date	string	✅	YYYY-MM-DD
country	string	✅	US or ES
customer_type	string	✅	B2B or B2C
tracking_number	string	✅	Carrier tracking number, min 8 characters
carrier	string	✅	See carriers below
category	string	✅	See categories below
description	string	✅	Free text, min 5 characters
status	string	✅	OPEN, CLOSED, DISCARDED
customer_email	string	✅	Valid email address of the reporting customer (sensitive)
satisfaction_score	integer	❌*	Integer 1–5. Required if status = CLOSED

*satisfaction_score is optional in the CSV structure, but a CLOSED record without it is considered incomplete.

⚠️ The customer_email field contains real customer email addresses and is why this file cannot be shared with external AI tools. The script must never print, log, or export individual email addresses in any output.

### VALIDATIONS

Valid carriers
Country	Carriers
US	UPS, FEDEX, DHL_US
ES	MRW, SEUR, DHL_ES, LOCAL_ES
A record is invalid if the carrier is not in the valid list for its declared country.

Valid categories
Code	Description
LOST_PARCEL	Parcel reported as lost
DELAYED_DELIVERY	Delivery past the expected date
WRONG_ADDRESS	Parcel sent to an incorrect address
RETURN_REQUEST	Customer requesting a return
DAMAGE	Product arrived damaged
Rules for Invalid Records
A record must be flagged as invalid if any of the following is true:

Rule	Description
Missing or invalid country	Empty or not US / ES
Missing or invalid carrier	Empty, unknown, or carrier does not operate in the declared country
Missing tracking_number	Empty or fewer than 8 characters
Missing or invalid category	Empty or not one of the 5 valid categories
Empty description	Empty or fewer than 5 characters
Missing or invalid customer_email	Empty or does not contain @
status = CLOSED and no satisfaction_score	Closed incident without a recorded score
satisfaction_score out of range	Value present but not between 1 and 5 (inclusive)
script must report how many records fall into each rule type.
## REQUIREMENTS
- Detect and count invalid records, detect hopw many and why they are invalid (missing field, out of range,value,etc)
- Calculate the following metrics on valid records
    - Total number of eleents processed (valid and invalid separately)
    - Breakdown by incident category
    - Breakdown by status
    - Average satisfaction index for closed cases that have a recorded score
 - Print the summary in the console in a readable format: use separators, clear labels and alignments
 - At the end of execution should ask user Export results to CSV? [y / n] if chosen y, save results to a csv file results.csv(one row per metric).

## EXPECTED OUTPUT
============================================================
  TRACKFLOW — INCIDENT REPORT ANALYSIS
  Source file: incidents-trackflow.csv
============================================================

TOTAL RECORDS IN FILE .......... 100
  ├─ Valid records ................ 95
  └─ Invalid / incomplete .......... 5

INVALID RECORDS BREAKDOWN
  ├─ Invalid tracking number ....... 1
  ├─ Carrier/country mismatch ...... 1
  ├─ Invalid or missing category ... 1
  ├─ Invalid or missing email ...... 1
  └─ Closed incident, no score ..... 1

BREAKDOWN BY CATEGORY (valid records)
  ├─ LOST_PARCEL .................. 14  (14.7%)
  ├─ DELAYED_DELIVERY ............. 38  (40.0%)
  ├─ WRONG_ADDRESS ................ 19  (20.0%)
  ├─ RETURN_REQUEST ............... 17  (17.9%)
  └─ DAMAGE ........................ 7   (7.4%)

BREAKDOWN BY STATUS (valid records)
  ├─ OPEN ......................... 29  (30.5%)
  ├─ CLOSED ....................... 52  (54.7%)
  └─ DISCARDED .................... 14  (14.7%)

BREAKDOWN BY COUNTRY (valid records) — recommended, not required
  ├─ US ........................... 50  (52.6%)
  └─ ES ........................... 45  (47.4%)

SATISFACTION INDEX (closed incidents)
  Scored incidents: 52 of 52
  Average score: 3.06 / 5.00
  ├─ Score 1 (Very dissatisfied) ... 6
  ├─ Score 2 (Dissatisfied) ....... 11
  ├─ Score 3 (Neutral) ............ 15
  ├─ Score 4 (Satisfied) .......... 14
  └─ Score 5 (Very satisfied) ...... 6

============================================================
