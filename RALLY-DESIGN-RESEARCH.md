# Rally course design research
Reviewed October 15, 2026. Findings inform implementation; this document does not change executable validation rules.

## Published exercise space: ASCA
The official PDF at the older URL below is now the June 2026 edition. Section 19.4.5 (printed p66) provides approximate space allowances:

| Exercise | Working space |
|---|---|
| Halt 1-2-3 / front with 1-2-3 backing | At least 15 ft |
| Serpentine without distractions | 26–32 ft long × 8–10 ft wide |
| Spiral | 19–23 ft long × 8–10 ft wide |
| Offset serpentine | 18 ft long × 12–15 ft wide |

Section 19.4.1 requires, for #316, 10 ft before and after bar/high jumps, and 10 ft before plus 12 ft after broad jumps. These are a published comparison basis for estimating similar movements, not automatic C-WAGS requirements. Allow for dog size and mobility aids.

https://asca.org/wp-content/uploads/2022/10/rallyrules.pdf

## C-WAGS
General guidelines (2021, p12): exercises should be at least 10 ft apart except joined exercises or stated distances. Some exercises explicitly need more room. Safe joined combinations must be marked on the map. No universal fence setback was established from this document.

Pro class pp2–3: P9 handler distance is 6 ft; P16 uses at least 15 ft before/beyond the jump with approximate 4–6 ft lateral offsets. P14 uses at least 20 ft dog-handler separation. P17/P18 use 8–18 ft. These require distinct dog, handler and equipment reference positions.

https://c-wags.org/wp-content/uploads/2021/04/Rally-Rules-and-Guidelines-2021.pdf
https://c-wags.org/wp-content/uploads/2017/01/Pro_Rally_Class.pdf

## CKC
The official combined book effective January 2025, rally section 13.3.1, places Master #312 at least 10 ft before the jump, with the handler path at least 3 ft away. The auxiliary stay needs a 15 ft leash-retrieval movement and walk-behind return (12.3/13.2). Ring area is 2,000–3,000 sq ft, minimum width 30 ft (8.18.1). These do not establish a universal fence setback or sign interval.

https://www.ckc.ca/en/Files/Forms/Shows-Trials/Event-Rules-Regulations/Obedience-Trial-and-Rally-Obedience-Trial-Rules-an-en

## AKC
The current official resource-centre link supplies regulations amended August 12, 2025. Chapter 2 section 23 places #210 at least 10 ft before the jump and 3 ft off its approach path; the following sign is at least 3 ft off the departure path. Master #301–303 start at least 8 ft before the jump. Cone patterns use approximately 6–8 ft intervals. Judges' guidance considers performed paths, correct angles, flow and all dog sizes. A universal 10 ft station-spacing requirement was not established from this text.

The 2021 virtual guide relaxes ring size and sign spacing. Do not treat virtual practice layouts as live-trial requirements.

https://images.akc.org/pdf/AKC1193_ROR001.pdf
https://www.akc.org/sports/rally/rally-resource-center/
https://www.akc.org/wp-content/uploads/2021/12/AKC-Rally-Virtual-Program-Guidebook-12-2021.pdf

## CARO
Downloaded and read the 2025 Rally Handbook v1.0 and December 14, 2025 amendments. Visually inspected Appendix B, printed p71 (PDF p75).

The jump diagram has a 5 ft wide × 4 ft deep send zone, front edge 10 ft before the jump plane. Handler lines are offset 3 ft for Advanced and 6 ft for Excellent and Versatility variants, shown from the nearby upright. These dimensions are send geometry, not a complete landing envelope. Broad jump and tunnel variants must be checked separately. Amendments include exceptions to the usual near-sign performance requirement.

No universal 10/15 ft station interval was established from this participant handbook. Existing app targets must remain provisional pending a judges' source.

https://canadianrallyo.ca/handbook-signs/
https://canadianrallyo.ca/download/2346/?tmstv=1761087672
https://canadianrallyo.ca/wp-content/uploads/2025/12/Amendments-to-the-2025-Rally-Handbook.pdf

## Training programs
Fenzi RA280 identifies 40 × 50 ft as ideal for longer practice courses, which may be broken down. Its TEAM discussion notes that tight layouts can hurt flow, particularly for large dogs. Town and Country's small-space class recommends choosing fewer stations when a whole course will not fit. This supports reducing content rather than shrinking all clearances. These pages do not define competition fence buffers.

https://www.fenzidogsportsacademy.com/10-course-descriptions/24390-ra280-get-ready-to-rally-get-in-the-ring
https://www.fenzidogsportsacademy.com/blog/e263-denise-fenzi-heather-lawson-alycia-rogal-and-nicole-wiebusch-year-6-of-team-a-new-program?format=amp
https://townandcountrydtc.org/product/online-rally-small-spaces/

## SinisterLabs
Documentation supports overall and per-sign before/after minimum spacing, soft warnings, hard errors and married-sign exceptions. Proximity is centre to centre. The previously inspected C-WAGS archive contains no spacing tags. Desktop defaults remain unverified: file omissions do not prove the application has no defaults.

https://www.obediencestuff.com/Sinisterlabscom/RallyCourseDesigner/Help/Rally_Rule_Set_Definitions.html
https://www.obediencestuff.com/Sinisterlabscom/RallyCourseDesigner/Help/creatingeventfilesandcourses.html

## Recommended application model
- Preserve organization, source, edition, reference positions and requirement/recommendation status for each dimension.
- Represent signs, handler route, dog route and equipment independently.
- Rotate exercise working areas with approach heading. Include actual equipment dimensions, approach, departure and outside dog path.
- Keep step length and turn radius adjustable and labelled as assumptions.
- Compare occupied areas with fences, pillars, equipment and sign stands. Separate physical intersection from an estimated comfort buffer.
- Red: established violation or physical conflict. Amber: estimated allowance crowded or geometry unresolved. Green: passes currently modelled checks.
- The questionnaire remains useful for C-WAGS fence buffers, turning allowances, measurement endpoints and acceptable overlaps.

Public manuals and accessible training pages were reviewed. Private chats, paid lessons and desktop runtime behavior were not inspected. No organization has approved the app's geometry. No universal numerical fence setback was verified across these sources.
