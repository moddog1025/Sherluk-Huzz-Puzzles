# Sherlook Logic Puzzle

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

1. **Same Column (Pair)**  
    • Two items are in the **same column**.
    
2. **Same Column (Trio)**  
    • Three items are all in the **same column**.
    
3. **Different Columns**  
    • Two items are in **different columns**.
    
4. **Two Together, One Apart**  
    • Of three items, **two share a column** and the **third is elsewhere**.
    
5. **Adjacent Pair**  
    • Two items are in **neighboring (side‑by‑side) columns** (in any order).
    
6. **Consecutive Trio**  
    • Three items occupy **three consecutive columns** (in any order).
    
7. **Gap Trio**  
    • Two items are **exactly two columns apart** (one column between), and the **third** is **not** in that middle column.
    
8. **Left Of**  
    • The **first** item is **somewhere to the left** of the **second** (distance unspecified).

## Clue Key

| ID  | Clue                    | Items | Orientation | Order                                                                                                                                                 |
| --- | ----------------------- | ----- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| SCP | Same Column Pair        | 2     | Vertical    | Any                                                                                                                                                   |
| SCT | Same Column Trio        | 3     | Vertical    | Any                                                                                                                                                   |
| DC  | Different Columns       | 2     | Vertical    | Any                                                                                                                                                   |
| TTO | Two-Together, One Apart | 3     | Vertical    | Together items listed as first two in the list                                                                                                        |
| ACP | Adjacent Column Pair    | 2     | Horizontal  | Any                                                                                                                                                   |
| ACT | Adjacent Column Trio    | 3     | Horizontal  | Any                                                                                                                                                   |
| GT  | Gap Trio                | 3     | Horizontal  | First and third item in the list are one column separated items with the item that isn't between the columns as the middle or second item in the list |
| LO  | Left Of                 | 2     | Horizontal  | Left item listed first, right item second                                                                                                             |

---

## Puzzle Flow & Tips

- **Start with strong anchors:** Use Same‑Column and Consecutive clues to fix initial groupings.
    
- **Layer adjacency:** Apply Adjacent Pair and Gap Trio to refine positions.
    
- **Use exclusivity:** Different Columns and Two‑Together clues isolate exceptions.
    
- **Finish with order:** Left Of clues break remaining ties.
    

A satisfying solve should flow from broad grouping to fine ordering, ending with only one valid assignment.