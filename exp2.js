function manageStudent() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, 1000);
    });
}

function updateStudent() {
    console.log("Updating the Student Data");
}

// Usage with Async/Await
async function main() {
    await manageStudent();
    updateStudent();
}

main();