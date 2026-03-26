"Balancing Sets of ±1 Vectors Given integers n and d, find a minimal family of
±1 vectors of dimension n such that for any ±1 vector w, there is a vector v in the family
satisfying |v·w| ≤ d. Implement a generalization of Knuth’s construction to computationally
demonstrate the tight optimal bound K(n, d) = ⌈n/(d + 1)⌉. The program should take n
and d as inputs, generate the minimal balancing set, and empirically verify the bound by
testing against a comprehensive set of random ±1 test vectors w. Documentation must
include the generation logic, empirical validation of the theoretical bound, and an analysis
of computational limits for large n.
Balancing Sets of 0 − 1 Vectors Adapt the balancing sets problem from the ±1
domain to binary 0 − 1 vectors, where the vectors w are restricted to {0, 1}n, but the
inner product condition remains the same as in the ±1 scenario. Develop a computational
heuristic (e.g., greedy algorithm or local search) to find small balancing sets for this 0 − 1
variant for given values of n and d. Documentation should mathematically formulate the
modified inner product constraint, report the empirically found minimal set sizes for small
n, and compare these results of the worst-case tight bound of ⌈n/(2 · d)⌉ in this case, with
the bounds for the ±1 problem."
Implement the 0-1 version and then a simple frontend wrapper using React and graphical elements to ensure smooth UI/UX.