# output tuples: id, feature1, feature2, ... to stdout
import sys
import random

feature_domains = [
  [0, 1],
  [0, 1, 2, 3, 4, 5]
  # , [0, 1, 2, 3]
]

n = int(sys.argv[1])

for i in range(n):
  line = []

  for d in feature_domains:
    line.append(str(random.choice(d)))

  print(','.join(line))


