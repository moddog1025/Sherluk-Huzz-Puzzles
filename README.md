# Sherluuk Logic Puzzle


A classic logic puzzle on a 5×5 grid (rows A–E, columns 1–5). Each row contains exactly one instance of its lettered item in each column. Players use relational clues to deduce which column holds each item.

---

## Puzzle Definition
 
- **Grid:** 5 rows (A, B, C, D, E) × 5 columns (1–5).
- **Items:** A1–A5 in row A, B1–B5 in row B, etc.
- **Solution:** A complete assignment of each item to a unique column per row.
- **Objective:** Determine the exact column for each item, leaving only one possibility per cell.

---
## How to Play

1. **Initialize:** All items are possible in every column of their row.

2. **Apply Clues:** Each clue imposes a constraint, eliminating possibilities.

3. **Mark Off:** Eliminate ruled‑out placements; if only one remains, that cell is solved.

4. **Propagate:** A solved cell removes that item from other cells in its row.

5. **Repeat:** Continue using clues and elimination until the grid is fully solved.

---
## Clue Types & Meanings

1. **Same Column Pair**  
    • Two items are in the **same column**.

2. **Same Column Trio**  
    • Three items are all in the **same column**.

3. **Adjacent Column Pair**  
    • Two items occupy **neighboring (side‑by‑side) columns** (in any order).

4. **Adjacent Column Trio**  
    • Three items occupy **three neighboring columns** (in any order, items from any rows, same or different).

5. **Gap Trio**  
    • Two items are **exactly two columns apart** (one column between), and the **third** is **not** in that middle column.

6. **Left Of**  
    • The **first** item is in a column **somewhere to the left** of the **second** item's column (distance unspecified, items from any rows, same or different).

---
## Clue Key

| ID  | Clue                 | Items | Orientation | Order                                                                                                                                                                             |
| --- | -------------------- | ----- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SCP | Same Column Pair     | 2     | Vertical    | Any                                                                                                                                                                               |
| SCT | Same Column Trio     | 3     | Vertical    | Any                                                                                                                                                                               |
| ACP | Adjacent Column Pair | 2     | Horizontal  | Any                                                                                                                                                                               |
| ACT | Adjacent Column Trio | 3     | Horizontal  | Any                                                                                                                                                                               |
| GT  | Gap Trio             | 3     | Horizontal  | First and third items in the list are in columns separated by exactly one column. The second item on the list is in a column that isn't the column separating the other two items |
| LO  | Left Of              | 2     | Horizontal  | Left item listed first, right item second                                                                                                                                         |

---
