const next = document.querySelector(".next");
const prev = document.querySelector(".prev");
const movies = document.querySelector(".movies");
next.addEventListener("click", function() {
    movies.scrollBy({
        left: 1500,
        behavior: "smooth"
    });
});

prev.addEventListener("click", function() {
    movies.scrollBy({
        left: -1500,
        behavior: "smooth"
    });
});