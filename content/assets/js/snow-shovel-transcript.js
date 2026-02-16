// Snow Shovel Emoji Transcript - Interactive navigation
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var container = document.getElementById("transcript-container");
    if (!container) return;

    var messages = container.querySelectorAll(".message");
    if (messages.length === 0) return;

    var navRewind = container.querySelector(".nav-rewind");
    var navPrev = container.querySelector(".nav-prev");
    var navNext = container.querySelector(".nav-next");
    var navFfwd = container.querySelector(".nav-ffwd");
    var navProgress = container.querySelector(".nav-progress");
    var lightbox = document.getElementById("lightbox");
    var lightboxImg = document.getElementById("lightbox-img");
    var postscript = document.getElementById("transcript-postscript");
    var currentIndex = 0;
    var total = messages.length;

    function scrollToMessage(msg) {
      var rect = msg.getBoundingClientRect();
      var viewportHeight = window.innerHeight;
      var msgHeight = rect.height;
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      if (msgHeight >= viewportHeight) {
        // Message is taller than viewport: put its top at the top
        window.scrollTo({ top: scrollTop + rect.top, behavior: "smooth" });
      } else {
        // Message is shorter than viewport: put its bottom at the bottom
        var targetScroll = scrollTop + rect.bottom - viewportHeight;
        // But don't scroll up past the message top
        var topAligned = scrollTop + rect.top;
        if (targetScroll < topAligned) {
          targetScroll = topAligned;
        }
        window.scrollTo({ top: targetScroll, behavior: "smooth" });
      }
    }

    function updateDisplay() {
      for (var i = 0; i < total; i++) {
        if (i <= currentIndex) {
          messages[i].classList.add("active");
        } else {
          messages[i].classList.remove("active");
        }
      }
      navRewind.disabled = currentIndex === 0;
      navPrev.disabled = currentIndex === 0;
      navNext.disabled = currentIndex === total - 1;
      navFfwd.disabled = currentIndex === total - 1;
      navProgress.textContent = (currentIndex + 1) + " / " + total;

      // Reveal postscript when the last message is reached
      if (postscript && currentIndex === total - 1) {
        postscript.classList.add("visible");
      }
    }

    function goNext() {
      if (currentIndex < total - 1) {
        currentIndex++;
        updateDisplay();
        // Wait a tick for the message to render, then scroll
        requestAnimationFrame(function () {
          scrollToMessage(messages[currentIndex]);
        });
      }
    }

    function goPrev() {
      if (currentIndex > 0) {
        messages[currentIndex].classList.remove("active");
        currentIndex--;
        updateDisplay();
        requestAnimationFrame(function () {
          scrollToMessage(messages[currentIndex]);
        });
      }
    }

    function goStart() {
      if (currentIndex > 0) {
        for (var i = currentIndex; i > 0; i--) {
          messages[i].classList.remove("active");
        }
        currentIndex = 0;
        updateDisplay();
        requestAnimationFrame(function () {
          scrollToMessage(messages[0]);
        });
      }
    }

    function goEnd() {
      if (currentIndex < total - 1) {
        currentIndex = total - 1;
        updateDisplay();
        requestAnimationFrame(function () {
          scrollToMessage(messages[currentIndex]);
        });
      }
    }

    // Initial state: show only first message, no animation
    messages[0].classList.add("active", "no-animate");
    updateDisplay();
    // Remove no-animate after a tick so future messages animate
    setTimeout(function () {
      messages[0].classList.remove("no-animate");
    }, 50);

    // Navigation buttons
    navRewind.addEventListener("click", goStart);
    navPrev.addEventListener("click", goPrev);
    navNext.addEventListener("click", goNext);
    navFfwd.addEventListener("click", goEnd);

    // Keyboard navigation
    document.addEventListener("keydown", function (e) {
      // Don't capture if user is in an input/textarea
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.isContentEditable
      )
        return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "Home") {
        e.preventDefault();
        goStart();
      } else if (e.key === "End") {
        e.preventDefault();
        goEnd();
      } else if (e.key === "Escape" && lightbox.classList.contains("active")) {
        closeLightbox();
      }
    });

    // Image lightbox
    function openLightbox(src) {
      lightboxImg.src = src;
      lightbox.classList.add("active");
    }

    function closeLightbox() {
      lightbox.classList.remove("active");
      lightboxImg.src = "";
    }

    // Click handler for images in messages
    container.addEventListener("click", function (e) {
      if (e.target.tagName === "IMG" && e.target.closest(".message-content")) {
        openLightbox(e.target.src);
      }
    });

    // Click overlay to close lightbox
    if (lightbox) {
      lightbox.addEventListener("click", function (e) {
        if (e.target !== lightboxImg) {
          closeLightbox();
        }
      });
    }
  });
})();
