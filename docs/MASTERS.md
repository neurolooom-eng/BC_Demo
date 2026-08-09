# Process Check Sheet — Google Sheet backend structure

Column structure for the Google Sheet that backs the Process Check Sheet (PCS)
module, form **QC FMT 038 Rev 10**. Create one tab per table below, with **row 1
as the exact header** (column names in `code` font). Every tab's first column is
`id` (a stable unique key) to match the rest of the app's data layer
(`src/data/repository.ts`, `google-apps-script/Code.gs`).

Conventions: `bool` = TRUE/FALSE, `enum(...)` = one of the listed values,
`ref→Tab` = the `id` of a row in another tab (foreign key), `json` = a JSON-text
cell. Times are `HH:MM` (24h). Blank `min`/`max` means "no numeric limit".

---

## A. Masters (client-managed reference data)

These 12 tabs give the client complete control — lists, people, **spec limits**,
alert routing, and even the form's own fields — with no developer involvement.

### 1. `Lines`
| Column | Type | Example | Notes |
|---|---|---|---|
| `id` | text | LINE-01 | |
| `code` | text | 01 | shown on the sheet |
| `name` | text | Mando Model Line | |
| `active` | bool | TRUE | |

### 2. `Machines`
| Column | Type | Example | Notes |
|---|---|---|---|
| `id` | text | MC-06 | |
| `code` | text | 06 | M/C No |
| `lineId` | ref→Lines | LINE-01 | |
| `description` | text | | optional |
| `active` | bool | TRUE | |

### 3. `Furnaces`
| Column | Type | Example | Notes |
|---|---|---|---|
| `id` | text | HF1 | |
| `code` | text | HF1 | |
| `type` | enum(Melting,Holding) | Melting | |
| `active` | bool | TRUE | |

### 4. `Shifts`
| Column | Type | Example | Notes |
|---|---|---|---|
| `id` | text | SH-1 | |
| `code` | text | I | |
| `name` | text | 1st Shift | |
| `startTime` | time | 06:30 | |
| `endTime` | time | 14:30 | |
| `slotMinutes` | number | 30 | column interval on the sheet |
| `sequence` | number | 1 | print order |

### 5. `MetalGrades`
| Column | Type | Example |
|---|---|---|
| `id` | text | GRADE-AC2A |
| `code` | text | AC2A |
| `name` | text | AC2A |
| `active` | bool | TRUE |

### 6. `Alloys`
| Column | Type | Example | Notes |
|---|---|---|---|
| `id` | text | ALLOY-BC | |
| `name` | text | Best Cast Alloy | |
| `type` | enum(BestCast,Other) | BestCast | |
| `active` | bool | TRUE | |

### 7. `Gases` (degassing gases)
| Column | Type | Example |
|---|---|---|
| `id` | text | GAS-N2 |
| `code` | text | N2 |
| `name` | text | Nitrogen |
| `active` | bool | TRUE |

### 8. `Coatings`
| Column | Type | Example | Notes |
|---|---|---|---|
| `id` | text | COAT-LK140 | |
| `name` | text | Lubrikote 140 | |
| `type` | enum(DieSpray,RunnerRaiser) | DieSpray | |
| `active` | bool | TRUE | |

### 9. `Employees` (signatories)
Operators, shift supervisors and in-charge. *Can be the app's existing `Users`
tab instead — keep this only if signatories are not app users.*
| Column | Type | Example | Notes |
|---|---|---|---|
| `id` | text | EMP-VIMAL | |
| `name` | text | Vimal | |
| `role` | enum(Operator,ShiftSupervisor,InCharge) | ShiftSupervisor | |
| `active` | bool | TRUE | |

### 10. `Parameters` (the spec master — drives highlights & alerts)
Every measurable/checkable field, its legal range and where/when it is captured.
This is the single source of truth for out-of-spec detection.
| Column | Type | Example | Notes |
|---|---|---|---|
| `id` | text | PRM-MELT-TEMP | |
| `code` | text | MELT_TEMP | stable key used by readings |
| `name` | text | Melting Metal Temp | printed row label |
| `category` | text | Melting | grouping |
| `cadence` | enum(Day,Slot,MachineSetup,Shift,Startup) | Slot | when it's entered |
| `appliesTo` | enum(Global,Machine) | Global | Machine = one value per machine |
| `dataType` | enum(Number,Decimal,Text,Enum,YesNo) | Number | from the FieldTypes catalog |
| `unit` | text | °C | |
| `min` | number | 720 | lower spec limit (blank = none) |
| `max` | number | 740 | upper spec limit (blank = none) |
| `target` | text | | standard/target value if fixed |
| `enumValues` | text | | comma list when dataType=Enum |
| `mandatory` | bool | TRUE | |
| `sortOrder` | number | 40 | print/entry order |
| `active` | bool | TRUE | |

### 11. `AlertRecipients`
Who is emailed when a reading breaches spec.
| Column | Type | Example | Notes |
|---|---|---|---|
| `id` | text | AR-QA | |
| `name` | text | QA Admin | |
| `email` | email | qa@bestcastgroup.com | |
| `scope` | enum(All,Line) | All | |
| `lineId` | ref→Lines | | required when scope=Line |
| `minSeverity` | enum(Warning,Critical) | Warning | only alert at/above this |
| `active` | bool | TRUE | |

### 12. `FieldDefinitions` (optional — lets the client reshape the form)
Controls which fields appear, in which section, order and as what input — so the
form itself can change without a developer.
| Column | Type | Example | Notes |
|---|---|---|---|
| `id` | text | FD-001 | |
| `section` | enum(DayHeader,Slot,MachineSetup,Shift,Startup) | Slot | |
| `parameterId` | ref→Parameters | PRM-MELT-TEMP | |
| `label` | text | Melting Metal Temp. 720°C~740°C | override label |
| `dropdownSource` | text | Machines | tab to pull options from |
| `mandatory` | bool | TRUE | |
| `sortOrder` | number | 40 | |
| `active` | bool | TRUE | |

---

## B. Transaction tabs (the captured check-sheet data)

One **day sheet** per Line per Date, covering all three shifts.

### `DaySheets` (header — one row per day/line)
| Column | Type | Notes |
|---|---|---|
| `id` | text | e.g. DS-2026-03-10-L01 |
| `date` | date | |
| `lineId` | ref→Lines | |
| `metalGradeId` | ref→MetalGrades | |
| `gasId` | ref→Gases | |
| `furnaceNos` | text | e.g. HF1+HF2 |
| `bestCastAlloy` | bool | |
| `otherAlloy` | bool | |
| `inChargeSign` | text | Employee id/name |
| `errorProofsOk` | bool | |
| `errorProofsComment` | text | |
| `status` | enum(Draft,Submitted,Approved) | |

### `DaySheetMachines` (per machine used that day)
| Column | Type | Notes |
|---|---|---|
| `id` | text | |
| `daySheetId` | ref→DaySheets | |
| `machineId` | ref→Machines | |
| `bcNo` | text | BC No |
| `dieCoatThickness` | number | µm |
| `diePreheatTemp` | number | °C |
| `coolingTime` | number | sec |
| `pouringTime` | number | sec |
| `tiltingTime` | number | sec |
| `degasKillingTime` | number | min |

### `Readings` (tall — one row per slot × parameter)
The main data table. Machine-level readings (e.g. Die Temp) carry `machineId`;
line-level readings leave it blank.
| Column | Type | Notes |
|---|---|---|
| `id` | text | |
| `daySheetId` | ref→DaySheets | |
| `shiftId` | ref→Shifts | |
| `slotTime` | time | column header, e.g. 07:30 |
| `machineId` | ref→Machines | blank for line-level |
| `parameterCode` | ref→Parameters.code | |
| `value` | text/number | |
| `outOfSpec` | bool | computed on save (value < min or > max) |

### `CorePinChecks` (per shift)
| Column | Type | Notes |
|---|---|---|
| `id` | text | |
| `daySheetId` | ref→DaySheets | |
| `shiftId` | ref→Shifts | |
| `machineId` | ref→Machines | optional |
| `cavities` | json | `[true,true,false,...]` for cavity 1–10 |
| `comment` | text | e.g. "Core pin verified" |

### `Startups` (die-preparation startup, once/day)
| Column | Type | Notes |
|---|---|---|
| `id` | text | |
| `daySheetId` | ref→DaySheets | |
| `diePreheatSOP` | text | e.g. 247°C |
| `dieRunnerRaiserCoating` | enum(OK,NotOK) | |
| `dieSprayCoatingId` | ref→Coatings | |
| `dpt` | enum(OK,NotOK) | |
| `rejectedAtStart` | number | 3–5 rejected |

### `ShiftSignoffs` (per shift)
| Column | Type | Notes |
|---|---|---|
| `id` | text | |
| `daySheetId` | ref→DaySheets | |
| `shiftId` | ref→Shifts | |
| `operatorSign` | text | |
| `supervisorSign` | text | |

### `Alerts` (breach log / email audit)
| Column | Type | Notes |
|---|---|---|
| `id` | text | |
| `daySheetId` | ref→DaySheets | |
| `parameterCode` | ref→Parameters.code | |
| `machineId` | ref→Machines | optional |
| `shiftId` | ref→Shifts | |
| `slotTime` | time | |
| `value` | text | |
| `min` | number | |
| `max` | number | |
| `severity` | enum(Warning,Critical) | |
| `emailedTo` | text | recipients |
| `emailedAt` | datetime | |
| `acknowledgedBy` | text | |

---

## C. Highlights & email alerts

- **Limits** come from `Parameters.min`/`max`. On save, each reading is compared;
  out-of-range → `Readings.outOfSpec = TRUE`.
- **Highlight**: out-of-spec values render **red** in the entry grid and on the
  day print (see `ProcessCheckSheetPrint`).
- **Email**: the Apps Script backend exposes an `alert` action that emails the
  matching `AlertRecipients` (via `MailApp`) with Line / Machine / Shift /
  Parameter / value vs limit / time, and logs a row in `Alerts`. See
  `google-apps-script/README.md`.

## D. How many masters?

**12 tabs** for complete client control. Two already exist in the app and can be
reused instead of new tabs: **`Parameters`** supersedes the existing
`Specifications`, and **`Employees`** can be the existing `Users`. So as few as
**~10 new tabs** in practice. The three that actually deliver "change anything
without a developer" are `Parameters` (limits), `AlertRecipients` (routing) and
`FieldDefinitions` (the form itself).
