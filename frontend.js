function display() {
    console.log("Statement1");

    setTimeout(() => {
        console.log("Statement2");
    }, 10000);

    console.log("Statement3");
    console.log("Statement4");
}

display();