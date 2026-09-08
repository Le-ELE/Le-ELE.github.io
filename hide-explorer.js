// Hide Explorer, Search, and Graph on student pages
(function() {
  function hideElements() {
    // Hide left sidebar (Explorer + Search)
    var leftSidebar = document.querySelector('.left.sidebar');
    if (leftSidebar) leftSidebar.style.display = 'none';

    // Hide right sidebar (Graph)
    var rightSidebar = document.querySelector('.right.sidebar');
    if (rightSidebar) rightSidebar.style.display = 'none';

    // Hide breadcrumb
    var breadcrumb = document.querySelector('.breadcrumb-container');
    if (breadcrumb) breadcrumb.style.display = 'none';

    // Make center content full width
    var center = document.querySelector('.center');
    if (center) {
      center.style.marginLeft = '0';
      center.style.maxWidth = '100%';
    }
  }
  // Run immediately and also after delay for SPAs
  hideElements();
  setTimeout(hideElements, 500);
  setTimeout(hideElements, 1000);
})();
