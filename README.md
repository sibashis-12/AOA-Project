# Balancing Sets of Vectors

Interactive React application that implements and visualises two variants of the **balancing sets** problem from combinatorics / analysis of algorithms.

---

## Problem Definitions

### 1. Balancing Sets of ±1 Vectors

**Input:** integers *n* (dimension) and *d* (inner-product threshold).  
**Output:** a minimal family F ⊆ {−1,+1}^n such that for every ±1 vector *w* there exists *v* ∈ F with **|v·w| ≤ d**.

**Optimal bound:** K(n, d) = ⌈n / (d + 1)⌉

**Algorithm:** Greedy set-cover (exact for n ≤ 14; partition construction fallback for n > 14).

**Key identity** used for fast inner-product computation:
```
v · w  =  n − 2 · popcount(v_mask XOR w_mask)
```
where both ±1 vectors are encoded as bitmasks (bit *i* = 1 ↔ +1).

---

### 2. Balancing Sets of 0-1 Vectors

**Input:** integers *n* and *d*.  
**Output:** a minimal family F ⊆ {−1,+1}^n such that for every binary vector *w* ∈ {0,1}^n there exists *v* ∈ F with **|v·w| ≤ d**.

Inner product formula for v ∈ {±1}^n, w ∈ {0,1}^n:
```
v · w  =  2 · popcount(M_v AND M_w) − popcount(M_w)
```

**Theoretical bound:** K₀₁(n, d) = ⌈n / (2d)⌉

**Algorithm:** Greedy set-cover over all 2^n test vectors (exact for n ≤ 12; randomised-candidate greedy for n > 12).

---

## Generation Logic

Both algorithms follow the same greedy set-cover pattern:

1. Start with the complete set of uncovered test vectors.
2. At each step, select the ±1 candidate vector that covers the most currently-uncovered test vectors (i.e., maximises the number of *w* in the uncovered set where |v·w| ≤ d).
3. Mark those test vectors as covered and repeat until the uncovered set is empty.

The greedy algorithm is guaranteed to terminate in at most 2^n steps.  For the ±1 variant, the number of steps is typically at or near K(n, d) = ⌈n/(d+1)⌉.

---

## Empirical Validation

The app runs two verification passes after building each family:

- **Random sampling** — checks 2000 random test vectors.
- **Exhaustive check** (for n ≤ 14 / n ≤ 20 respectively) — iterates over all 2^n test vectors.

The results are displayed as:
- Coverage percentage.
- Maximum best |v·w| observed (≤ d confirms the family is valid).
- Step-by-step greedy coverage progress (area chart).

The 0-1 section also includes a comparison table and bar chart showing empirical family sizes versus ⌈n/(2d)⌉ across a range of n values.

---

## Computational Limits

| Variant | Exact greedy | Notes |
|---------|-------------|-------|
| ±1 | n ≤ 14 | O(4^n · n) per step |
| 0-1 | n ≤ 12 | O(4^n · n) per step |

For larger n, approximate strategies are used (partition construction for ±1; random candidate sampling for 0-1).  The UI warns the user when the result is approximate.

---

## Running the App

```bash
npm install
npm run dev      # development server at http://localhost:5173
npm run build    # production build → dist/
```

---

## Tech Stack

- **React 19** + **Vite** — UI framework and build tool
- **Recharts** — bar chart (bound comparison) and area chart (coverage progress)
- Pure JavaScript algorithms with typed arrays for performance
