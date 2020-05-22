const data =
  [ 1, 2, 3, 4 ]
  
console.log(data.flatMap(x => Array(x).fill(x)))