const fizzBuzz = (num) => {
  let output = "";
  for (let i = 1; i <= num; i++) {
    const isFizz = i % 3 === 0;
    const isBuzz = i % 5 === 0;
    output += isFizz ? (isBuzz ? "FizzBuzz, " : "Fizz, ") : (isBuzz ? "Buzz, " : i + ", ");
  }
  console.log(output.trim().slice(0, -1));
}

fizzBuzz(100);