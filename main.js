const imageProps = {
  0: {
    title: "KOREA",
    actionText: "traveled to",
    numImages: 5,
    textId: "korea-blurb",
    galleryId: "korea-gallery"
  },
  1: {
    title: "FOOD (no way)",
    actionText: "ate lots of",
    numImages: 2,
    textId: "food-blurb",
    galleryId: "food-gallery"
  },
  2: {
    title: "WEDDING",
    actionText: "had a",
    numImages: 3,
    textId: "wedding-blurb",
    galleryId: "wedding-gallery"
  },
  3: {
    title: "SELFIES (lol)",
    actionText: "took many",
    numImages: 3,
    textId: "selfies-blurb",
    galleryId: "selfies-gallery"
  },
  4: {
    title: "to do",
    actionText: "have a bunch more",
    numImages: 3,
    textId: "misc-blurb",
    galleryId: "misc-gallery"
  },

};

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

const foodColors = [
  "#df715b",
  "#dfa720",
  "#587477",
  "#3b5f34",
  "#c27e4c"
];

const handleRecipientsColorChange = (curr) => {
  switch (curr) {
    case document.getElementById("food-thumbnail"):
      for (const letter of document.querySelectorAll(".dad-letter")) {
        const i = Math.floor(Math.random() * foodColors.length);
        letter.style.color = foodColors[i];
      }
      for (const letter of document.querySelectorAll(".jane-letter")) {
        const i = Math.floor(Math.random() * foodColors.length);
        letter.style.color = foodColors[i];
      }
      break;
    case document.getElementById("selfies-thumbnail"):
      for (const letter of document.querySelectorAll(".dad-letter")) {
        letter.style.color = "#ea0273";
      }
      for (const letter of document.querySelectorAll(".jane-letter")) {
        letter.style.color = "#18c1ed";
      }
      break;
  } 
}

async function imageCallback() {
  const imageDelta = await centerImage(this);
  isFocused = await focusImage(imageDelta, this);
  for (const image of images) {
    image.removeEventListener('click', imageCallback);
  }
  await expandImage(this);

  setTimeout(() => {
    this.removeEventListener("click", imageCallback);
    window.addEventListener('click', escapeFocus);
    const imageText = document.querySelector(".image-text");
    const imageIndex = getIndex(this);
    imageText.id = imageProps[imageIndex].textId;
    document.querySelector(".image-text").addEventListener('click', handleTextClick);
  }, 2000)
}

async function centerImage(curr) {
  return new Promise((res, rej) => {
    try {
      curr.removeEventListener("click", centerImage);
      handleRecipientsColorChange(curr);
      const centerX = window.innerWidth * 0.5;
      const rect = curr.getBoundingClientRect();
      const focusedCenterX = rect.left + (rect.width / 2);
      const delta = (centerX - focusedCenterX) * -1;
      res(delta);
    } catch (err) {
      rej(err);
    }
  }) 
}

let clickStart = 0;
function handleMouseDown(e) {
  track.dataset.mouseDownAt = e.clientX;
  clickStart = Date.now();
  document.body.classList.add("no-select");
}

let isFocused = false;
function handleMouseUp(e) {
  track.dataset.mouseDownAt = "0";
  track.dataset.prevPercentage = track.dataset.percentage;
  document.body.classList.remove("no-select");
}

function handleMouseMove(e) {
  if (track.dataset.mouseDownAt === "0" || isFocused) {
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
  if (isFocused) {
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
for (const image of images) {
  image.addEventListener("click", imageCallback);
}

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


function centerDadAndJaneText(currImage) {
  const tempIgnoreList = document.querySelectorAll(".no-hl");
  for (let el of tempIgnoreList) {
    el.classList.add("invisible");
    el.style.position = "absolute";
  }

  const imageIndex = getIndex(currImage);
  document.getElementById("verb-span").innerText = imageProps[imageIndex].actionText;
  document.getElementById("verb-div").classList.add("reveal-text");
}

function getIndex(image) {
  switch (image) {
    case document.getElementById("korea-thumbnail"):
      return 0;
    case document.getElementById("food-thumbnail"):
      return 1;
    case document.getElementById("wedding-thumbnail"):
      return 2;
    case document.getElementById("selfies-thumbnail"):
      return 3;
    case document.getElementById("misc-thumbnail"):
      return 4;
  }
}

async function focusImage(delta, imageToExpand) {
  return new Promise((res) => {
    centerDadAndJaneText(imageToExpand);
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
    imageToExpand.classList.add("focused");
    res(true);
  });
};

async function expandImage(image) { 
  return new Promise((res) => {
    const imageIndex = getIndex(image);
    image.style.transition = "transform 0.5s ease";
    if (imageIndex !== 3) {
      image.style.transform = "scale(2.5)";
    } else {
      image.style.transform = "scale(2.25)";
    }
    image.style.objectFit = "contain";

    const textContainer = document.getElementById("image-text-container");
    textContainer.classList.remove("hidden");
    const titleContainer = document.querySelector(".image-text");
    titleContainer.classList.remove("hidden");
    const textSup = document.getElementById("image-hover-sup");

    const textStyle = getTextStyle(imageIndex);
    const superscript = imageProps[imageIndex].numImages;
    setTimeout(() => {
      titleContainer.innerHTML = imageProps[imageIndex].title;
      textContainer.classList.add(textStyle);
      textSup.innerHTML = superscript;
      titleContainer.classList.add("visible");
    }, 1250)
    res();
  })
}

async function escapeFocus(e) {
  if (e.target !== document.getElementById("image-text") || e.target !== document.getElementById("back-button")) {
    isFocused = await unfocusImage();
  }
}

function getImageIndexFromTextId(textObject) {
  switch (textObject) {
    case document.getElementById("korea-blurb"):
      return 0;
    case document.getElementById("food-blurb"):
      return 1;
    case document.getElementById("wedding-blurb"):
      return 2;
    case document.getElementById("selfies-blurb"):
      return 3;
    case document.getElementById("misc-blurb"):
      return 4;
  }
}

function handleTextClick(e) {
  const imageIndex = getImageIndexFromTextId(this);
  const galleryContainer = document.getElementById("gallery");
  galleryContainer.scrollIntoView({ behavior: "smooth" });  
  const galleryId = imageProps[imageIndex].galleryId;
  document.getElementById(galleryId).classList.remove("hidden");

  window.removeEventListener("click", escapeFocus);
  window.removeEventListener("mousedown", handleMouseDown)
  window.removeEventListener("mouseup", handleMouseUp); 
  window.removeEventListener("mousemove", handleMouseMove);

  window.focus();
}

document.getElementById("back-button").addEventListener("click", handleBackButtonClick);

/**
  * Function to return back to the thumbnail image from the gallery.
  * @param e the Event object
  * @param {string} galleryId the id of the gallery
  */
async function handleBackButtonClick(e) {
  await scrollBackToThumbnail();
  setTimeout(() => {
    window.addEventListener("click", escapeFocus); // Add back escape button to return to gallery.
    window.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mouseup", handleMouseUp); 
    window.addEventListener("mousemove", handleMouseMove);
  }, 500)
  for (const image of document.querySelectorAll(".image-gallery")) {
    image.classList.add("hidden"); 
  }
}

async function scrollBackToThumbnail() {
  return new Promise((resolve, reject) => {
    try {
      document.getElementById("main-flex").scrollIntoView({ behavior: "smooth" });
      const galleryId = document.querySelector(".image-gallery").id;
      return resolve(galleryId);
    } catch (error) {
      reject(error);
    }
  });
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

const clearRecipientColor = () => {
    for (const letter of document.querySelectorAll(".dad-letter")) {
      letter.style.color = "";
    }
    for (const letter of document.querySelectorAll(".jane-letter")) {
      letter.style.color = "";
    }
}

async function unfocusImage() {
  return new Promise((res, rej) => {
    try {
      clearRecipientColor(); 
      window.removeEventListener("click", escapeFocus);

      const text = document.querySelector(".image-text");
      text.classList.remove("visible");
      
      document.getElementById("verb-div").classList.remove("reveal-text");
      for (const el of document.querySelectorAll(".no-hl")) {
        el.classList.remove("invisible");
        el.style.position = "static";
      }

      const image = document.querySelector(".focused");
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
      document.getElementById("image-text-container").classList.remove(getTextStyle(getIndex(image)));
      document.getElementById("image-hover-sup").innerText = "";

      image.classList.remove("focused");
      for (const image of images) {
        image.addEventListener('click', imageCallback);
      }

      res(false);
    } catch (error) {
      rej(error);
    } 
  })
}

