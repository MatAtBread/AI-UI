/// <reference path="../test.env.d.ts"/>

for await (const x of Test.count()) {
    console.log("The expected result is", x)
}

export { };