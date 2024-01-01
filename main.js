const blurbs = {
  0: "KOREA",
  1: "FOOD (wow)",
  2: "WEDDING",
  3: "SELFIES (lol)",
  4: "to do"
}

const numGalleryImages = {
  0: 5,
  1: 2,
  2: 3,
  3: 4,
  4: 3,
}

const incrementer = document.getElementById("curr-img");
const track = document.getElementById("image-track");

function calcNextPercentage(delta, maxDelta) {
  const percentage = (delta / maxDelta) * -100;
  const nextPercentageNotBound = parseFloat(track.dataset.prevPercentage) + percentage;
  const nextPercentage = Math.max(Math.min(nextPercentageNotBound, 0), -100);
  return nextPercentage;
}

function setNextPercentage(delta, maxDelta) {
  const nextPercentage = calcNextPercentage(delta, maxDelta);
  track.dataset.percentage = nextPercentage;
  track.animate({
    transform: `translate(${nextPercentage}%, -50%)`
  }, { duration: 1200, fill: "forwards" });
  
  for (const image of track.getElementsByClassName("image")) {
    image.animate({
      objectPosition: `${100 + nextPercentage}% center`
    }, { duration: 1200, fill: "forwards" });
  }
};

const isDragging = (e) => {
  const deltaThreshold = 5;
  const timeThreshold = 200;
  const clickDuration = Date.now() - clickStart;
  const mouseDelta = Math.abs(parseFloat(track.dataset.mouseDownAt) - e.clientX);
  return mouseDelta > deltaThreshold || clickDuration > timeThreshold;
}

const focusClosest = () => {
  const focused = images[closestIndex];
  const centerX = window.innerWidth * 0.5;
  const rect = focused.getBoundingClientRect();
  const focusedCenterX = rect.left + (rect.width / 2);
  const delta = (centerX - focusedCenterX) * -1;
  focusImage(delta, focused);
  hasFocused = true;
}

let clickStart = 0;
function handleMouseDown(e) {
  track.dataset.mouseDownAt = e.clientX;
  clickStart = Date.now();
  document.body.classList.add("no-select");
}

let hasFocused = false;
function handleMouseUp(e) {
  if (!isDragging(e) && !hasFocused) {
    focusClosest();
  } 
  
  track.dataset.mouseDownAt = "0";
  track.dataset.prevPercentage = track.dataset.percentage;
  document.body.classList.remove("no-select");
}

function handleMouseMove(e) {
  if (track.dataset.mouseDownAt === "0" || hasFocused) {
    return;
  }

  if (isDragging(e)) {
    const mouseDelta = parseFloat(track.dataset.mouseDownAt) - e.clientX;
    const maxDelta = window.innerWidth / 2;
    setNextPercentage(mouseDelta, maxDelta);
  }
}

let cumulativeScrollDelta = 0; // This will accumulate the scroll delta
let scrollTimeout;
function handleScroll(e) {
  if (hasFocused) {
    return;
  }
  const scrollSensitivity = 0.33;
  
  // Accumulate the scroll delta
  if (e.deltaX) {
    cumulativeScrollDelta += e.deltaX * scrollSensitivity;
  } else {
    cumulativeScrollDelta += e.deltaY * scrollSensitivity;
  }

  // Ensure that we don't scroll beyond the the left bound by assigning the minimum number we can scroll left to
  // to the actual delta value (computed from the previous percentage)
  const inverse = (track.dataset.prevPercentage / 100) * (window.innerWidth / 2);
  cumulativeScrollDelta = Math.max(cumulativeScrollDelta, inverse);

  // Now to set the right bound by setting the maximum number we can scroll right to as maxDelta (by assigning min to scrollDelta)
  const maxDelta = window.innerWidth / 2;
  cumulativeScrollDelta = Math.min(cumulativeScrollDelta, maxDelta);
  setNextPercentage(cumulativeScrollDelta, maxDelta);

  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    cumulativeScrollDelta = 0;
    track.dataset.prevPercentage = track.dataset.percentage;
  }, 300);
};

// Bind event listeners to window
window.addEventListener("wheel", handleScroll);
window.addEventListener("mousedown", handleMouseDown)
window.addEventListener("mouseup", handleMouseUp); 
window.addEventListener("mousemove", handleMouseMove);

// Add touch capabilities
window.ontouchstart = e => handleMouseDown(e.touches[0]);
window.ontouchend = e => handleMouseUp(e.touches[0]);
window.ontouchmove = e => handleMouseMove(e.touches[0]);

const images = document.querySelectorAll(".image");
let closestIndex = 0;
function updateCount() {
  const centerX = window.innerWidth * 0.5; // Center of the viewport
  let currClosestIndex = -1; // Start with an invalid index
  let currClosestDist = Number.MAX_VALUE; 

  // Loop through all images, not just the ones in 'entries'
  Array.from(images).forEach((image, index) => {
    const rect = image.getBoundingClientRect();
    const imageCenterX = rect.left + (rect.width / 2);
    const dist = Math.abs(imageCenterX - centerX);
    if (dist < currClosestDist) {
      currClosestDist = dist;
      currClosestIndex = index; // Directly use the loop index
    }
  });

  // If we found a closest image, update the counter
  if (currClosestIndex !== -1) {
    document.getElementById("curr-img").innerHTML = 1 + currClosestIndex;
    closestIndex = currClosestIndex;
  }
}

// Still need to instantiate the observer to call updateCount on intersection changes
const observer = new IntersectionObserver(updateCount, {
  // The threshold might need to be an array of thresholds to ensure continuous updates
  threshold: buildThresholdList()
});

images.forEach(image => observer.observe(image));

// This function builds an array of thresholds to ensure the callback runs continuously as elements are scrolled
function buildThresholdList() {
  let thresholds = [];
  let numSteps = 20;
  for (let i=1.0; i<=numSteps; i++) {
    let ratio = i/numSteps;
    thresholds.push(ratio);
  }
  return thresholds;
}
// Call updateCount initially to set the counter at the start
updateCount();

const actions = {
  0: "traveled to",
  1: "ate lots of",
  2: "had a",
  3: "took many",
  4: "have so much more"
}

function moveRecipients() {
  const tempIgnoreList = document.querySelectorAll(".no-hl");
  for (let el of tempIgnoreList) {
    el.classList.add("invisible");
    el.style.position = "absolute";
  }

  document.getElementById("verb-span").innerText = actions[closestIndex];
  document.getElementById("verb-div").classList.add("reveal-text");
}

function focusImage(delta, imageToExpand) {
  moveRecipients();
  const maxDelta = track.scrollWidth;
  const percentage = (delta / maxDelta) * -100;
  const nextPercentageNotBound = parseFloat(track.dataset.prevPercentage) + percentage;
  const nextPercentage = Math.max(Math.min(nextPercentageNotBound, 0), -100);
  
  track.dataset.percentage = nextPercentage;
  track.animate({
    transform: `translate(${nextPercentage}%, -50%)`,
  }, { duration: 400, fill: "forwards" });
  
  document.getElementById("x-hair").animate({
    opacity: `0%`
  }, { duration: 400, fill: "forwards" });

  for (const image of track.getElementsByClassName("image")) {
    if (image !== imageToExpand) {
      image.animate({
        objectPosition: `${100 + nextPercentage}% center`,
        opacity: "0%"
      }, { duration: 400, fill: "forwards" });
    } else {
      image.animate({
        objectPosition: "center"
      }, { duration: 400, fill: "forwards" });
    }
  }

  setTimeout(() => {
    expandImage(imageToExpand);
  }, 0); // Start expanding after the centering animation completes
};

function expandImage(image) { 
  image.style.transition = "transform 0.5s ease";
  if (closestIndex !== 3) {
    image.style.transform = "scale(2.5)";
  } else {
    image.style.transform = "scale(2.25)";
  }
  image.style.objectFit = "contain";

  const textContainer = document.getElementById("image-text-container");
  textContainer.classList = "";
  const text = document.getElementById("image-text");
  const textSup = document.getElementById("image-hover-sup");

  const textStyle = getTextStyle(closestIndex);
  const superscript = numGalleryImages[closestIndex];
  setTimeout(() => {
    text.innerHTML = blurbs[closestIndex];
    textSup.innerHTML = superscript;
    if (textStyle) {
      textContainer.classList.add(textStyle);
    }
    text.classList.add("visible");
  }, 1250);

  window.addEventListener('keyup', escapeFocus);

  text.addEventListener('click', handleTextClick);
}

function escapeFocus(e) {
  if (e.key === "Escape") {
    unfocusImage(images[closestIndex], getTextStyle(closestIndex));
  }
}

const handleTextClick = (e) => {
  window.removeEventListener('keyup', escapeFocus);
  const restOfImages = document.getElementById("rest-of-images");
  restOfImages.scrollIntoView({ behavior: "smooth" });
}

/**
  * Function to return back to the thumbnail image from the gallery.
  */
const handleBackThumbnailClick = (e) => {
  document.getElementById("main-flex").scrollIntoView({ behavior: "smooth" });
  window.addEventListener("keyup", escapeFocus); // Add back escape button to return to gallery.
}

const getTextStyle = (closestIndex) => {
  switch (closestIndex) {
    case 0: return "korea-text";
    case 1: return "food-text";
    case 2: return "wedding-text";
    case 3: return "selfies-text";
    case 4: return "final-text";
  }
}

function unfocusImage(image, textStyle) {
  document.removeEventListener("keyup", escapeFocus);
  const text = document.getElementById("image-text");
  text.classList.remove("visible");
  
  document.getElementById("verb-div").classList.remove("reveal-text");
  for (const el of document.querySelectorAll(".no-hl")) {
    el.classList.remove("invisible");
    el.style.position = "static";
  }

  setTimeout(() => {
    image.style.transition = "transform 0.5s ease";
    image.style.transform = "none";
    image.style.objectFit = "cover";
  }, 100);

  setTimeout(() => {
    document.getElementById("x-hair").animate({
      opacity: "100%"
    }, { duration: 450, fill: "forwards" });
    for (const img of track.getElementsByClassName("image")) {
      img.animate({
        opacity: "100%"
      }, { duration: 450, fill: "forwards" }) 
    }
  }, 100);

  document.getElementById("image-text-container").classList.add("hidden");
  hasFocused = false;
}
