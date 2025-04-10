$.fn.sScrollBar = function (options) {
	// Default options
    var settings = $.extend({
		scrollWidth: 5,
		borderRadius: 3,
		railBgColor: "#E1E5E6",
		handleBgColor: "#AAA",
		scrollBarOpacity: 1,
		railDefaultOpacity: 0.6,
		handleDefaultOpacity: 0.6,		
		railHoverOpacity: 1,
		handleHoverOpacity: 1,
		showArrows: true,
		clickScrollRate: 200,
		clickScrollSpeed: 200,
		arrowScrollRate: 50,
		hOffset: -3,
		vOffset: -3,
		rtl: true
	}, options);

	
	return this.each(function () {
		// select the container element
		var container = $(this); 

		// Check container has overflowing children
		$.fn.isOverflowing = function (direction) {
			
			if (direction == "vertical") {
				return Math.round(this.get(0).scrollHeight) > Math.round(this.innerHeight());
			}
			else if (direction == "horizontal") {
				return Math.round(this.get(0).scrollWidth) > Math.round(this.innerWidth());
			}
			return false;
		}

		// Convert into rgb
		function hexToRgb(rgb) {
			var hexCode;
			// Check if rgb is a shorthand hex code or not
			if (isShorthandHex(rgb)) {
				var fullHex = shorthandToFullHex(rgb);
				hexCode = fullHex;
			} else {
				hexCode = rgb;
			}

			// Remove the "#" symbol
			var hexCode = hexCode.slice(1);

			// Convert hex to decimal
			var red = parseInt(hexCode.substring(0, 2), 16);
			var green = parseInt(hexCode.substring(2, 4), 16);
			var blue = parseInt(hexCode.substring(4, 6), 16);

			return {
				red: red,
				green: green,
				blue: blue
			};
		}

		function isShorthandHex(hex) {
			return /^#([0-9a-fA-F]{3})$/.test(hex);
		}
		
		function shorthandToFullHex(shorthand) {
			if (isShorthandHex(shorthand)) {
				return shorthand.replace(/^#(\w)(\w)(\w)$/, "#$1$1$2$2$3$3");
			} else {
				return shorthand; // Return the original value if not a valid shorthand
			}
		}
		
		// Initiate vertical scroll
		function initVerticalScrollbar() {
			if (container.css("overflow-y") != "hidden") {
				const children = container.children();
				let totalHeight = 0;
				// Loop through each child and sum their heights
				children.each(function () {
					var $this = $(this);
					totalHeight = totalHeight+$this.outerHeight();
				});
	 
				if ( totalHeight >  container.outerHeight(true)) {
					if (container.isOverflowing("vertical") != false) {
						if (!container.hasClass("vScroll")) {
							container.addClass("vScroll");
						}
						if (!container.hasClass("noNativeScrollBar")) {
							container.addClass("noNativeScrollBar");
						}

						paddingTop = parseInt(container.css("padding-top"), 10),
						paddingRight = parseInt(container.css("padding-right"), 10),
						paddingBottom = parseInt(container.css("padding-bottom"), 10),
						paddingLeft = parseInt(container.css("padding-left"), 10);
						
						// Add padding for scrollbar to occuppy
						// 2px extra added for safety 
						if (settings.rtl && paddingRight < settings.scrollWidth + 2) {
							container.css("padding-right", settings.scrollWidth + 2)
						} else if (!settings.rtl && paddingLeft < settings.scrollWidth + 2) {
							container.css("padding-left", settings.scrollWidth + 2)
						}

						var totalChildrenHeight = container.prop("scrollHeight")-paddingTop-paddingBottom; 
						
						var upArrowSvg = '<svg class="arrow upArrow" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 800 492" style="enable-background:new 0 0 800 492;" xml:space="preserve"><g><path d="M781,472.9c-25.4,25.4-66.6,25.4-92,0L400,184.1L111.1,472.9c-25.4,25.4-66.6,25.4-92.1,0c-25.4-25.4-25.4-66.6,0-92.1 L400,0l380.9,380.9C806.4,406.3,806.4,447.5,781,472.9z"/></g></svg>';

						var downArrowSvg = '<svg class="arrow downArrow"  version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 800 492" style="enable-background:new 0 0 800 492;" xml:space="preserve"><g><path d="M780.9,111L400,491.9L19,111.2C-6.4,85.7-6.4,44.4,19,19c25.5-25.4,66.7-25.4,92.1,0L400,307.8L689,19 c25.4-25.4,66.6-25.4,92,0S806.4,85.7,780.9,111z"/></g></svg>';

						// create the verticalScrollbar element
						var vTrack = $('<div class="vScrollbarTrack">'+upArrowSvg+downArrowSvg+'<div class="ssb vScrollbarRail"></div></div>'),
							vHandle = $('<div class="vScrollbarHandle"></div></div>');
						
						// Append the scrollbar inside container
						if (container.find(".vScrollbarTrack").length === 0) {
							vTrack.appendTo(container);
						}
						
						var	$vTrackElm =  container.find(".vScrollbarTrack"),
							$vRailElm = container.find(".vScrollbarRail");	

						// insert the scrollbar after the container		
						if ($vRailElm.find(".vScrollbarHandle").length === 0) {
							$vRailElm.append(vHandle)
						}
						
						var $vScrollbarHandle = $vTrackElm.find(".vScrollbarHandle");
						
						// Set the width of the scroll bar
						$vTrackElm.width(settings.scrollWidth);

						var rgbValues = hexToRgb(settings.railBgColor);

						$vTrackElm.css({
							"background-color": "rgba("+rgbValues.red+", "+rgbValues.green+", "+rgbValues.blue+", "+settings.railDefaultOpacity+")",
							"opacity": settings.scrollBarOpacity
						});

						$vRailElm.css({
							"opacity": settings.railDefaultOpacity,
							"background-color": settings.railBgColor
						});

						$vScrollbarHandle.css({
							"width":settings.scrollWidth,
							"border-radius": settings.borderRadius,
							"background-color": settings.handleBgColor,
							"opacity": settings.handleDefaultOpacity
						});				

						// Set background color for arrows						
						$svg = container.find(".arrow");
						$svg.find('path').attr('fill', settings.railBgColor);

						$vTrackElm.find(".arrow").css({
							"opacity": settings.railDefaultOpacity,
							"height": settings.scrollWidth
						});

						// Set arrow border-radius
						// NOTE: top arrow is flipped vertically
						$vTrackElm.find(".upArrow").css({
							"top": -settings.scrollWidth,
							"border-top-right-radius": settings.borderRadius,
							"border-top-left-radius": settings.borderRadius,
							"background-position": "center center" 
						});
 
						$vTrackElm.find(".downArrow").css({
							"bottom": -settings.scrollWidth,
							"border-top-right-radius": settings.borderRadius,
							"border-top-left-radius": settings.borderRadius,
							"background-position": "center center" // flipped div
						});

						// Hover effects
						$vTrackElm.find(".upArrow,.downArrow").hover(
							function() {
								$(this).css({"opacity": 1,})
							},
							function() {
								$(this).css({"opacity": settings.railDefaultOpacity,})
							}
						);

						var contHeight = container.outerHeight();

						var arrowHeight = settings.scrollWidth,
							rightPosR = container.position().left + container.outerWidth(),
							borderInt = 0;

						if (settings.rtl) {
							var borderWidth = container.css('border-right-width');
							borderInt = parseFloat(borderWidth);
						} else {
							borderWidth = container.css('border-left-width');		
							borderInt = parseFloat(borderWidth);
						}

						var topBorderWidth = container.css('border-top-width'),
							topborderInt = parseFloat(topBorderWidth),
							bottomBorderWidth = container.css('border-bottom-width'),
							bottomborderInt = parseFloat(bottomBorderWidth);
						//-----------------------------------------------------
						// Handle arrows and adjust scroll bar dimensions
						//-----------------------------------------------------
						if (settings.showArrows) {
							$vTrackElm.height(contHeight-topborderInt-bottomborderInt-paddingTop-paddingBottom-(arrowHeight * 2));
						
							$vTrackElm.css({
								"left": rightPosR - settings.scrollWidth + settings.hOffset-borderInt,
								"top": container.position().top + arrowHeight + topborderInt+(paddingTop),
								"border-radius":settings.borderRadius 
							});
						} else {
							$vTrackElm.find(".arrow").hide();							
							$vTrackElm.height(contHeight-topborderInt-bottomborderInt-paddingTop-paddingBottom);
							
							$vTrackElm.css({
								"left": rightPosR-settings.scrollWidth+settings.hOffset-borderInt,
								"top": container.position().top+topborderInt+paddingTop,
								"border-radius":settings.borderRadius 
							})

						}
						//-----------------------------------------------------
						// set the height of the verticalScrollbar based on the height of the container
						scrollBarHeight = 100 * contHeight / totalChildrenHeight;						
						// scrollBarHeight = (scrollBarHeight > 100) ? 100 : scrollBarHeight;

						$vScrollbarHandle.height(scrollBarHeight+"%");
	
						
						
						// handle the scroll event of the container
						container.on("scroll", function () {
							// $vTrackElm.css({
							// 	"opacity": 1
							// });
							const scrollPercentage = container.scrollTop() / (totalChildrenHeight - container.height());
							const handleHeight = $vTrackElm.height() * container.height() / totalChildrenHeight;
					  
							$vScrollbarHandle.css({
							  top: scrollPercentage * ($vTrackElm.height() - handleHeight),
							  height: handleHeight
							});
						});
						
						//scroll content on track click (vertical scroll)	  
						$vRailElm.on("mousedown", function (e) { //Relative ( to its parent) mouse position  
							if (e.target === this) {
								var sPosition = $vScrollbarHandle.position(),
									handlePos = sPosition.top+settings.scrollWidth * 2,
									containerPos = container.offset().top;

								clickPos = e.pageY-containerPos
								console.log(handlePos, clickPos);
								if (handlePos > clickPos) {
									container.animate({
										scrollTop: container.scrollTop()-settings.clickScrollRate
									}, settings.clickScrollSpeed);
								} else if (handlePos < clickPos) {
									container.animate({
										scrollTop: container.scrollTop()+settings.clickScrollRate
									}, settings.clickScrollSpeed);
								}
							}
						});

						
						// Arrow click event
						var upArrow = container.find(".vScrollbarTrack").find(".upArrow");
						upArrow.on("mousedown", function (e) {
							initialScrollTop = container.scrollTop();
							container.animate({
								scrollTop: initialScrollTop-settings.arrowScrollRate
							}, settings.clickScrollSpeed);
						});

						var downArrow = container.find(".vScrollbarTrack").find(".downArrow");
						downArrow.on("mousedown", function (e) {
							initialScrollTop = container.scrollTop();
							container.animate({
								scrollTop: initialScrollTop+settings.arrowScrollRate
							}, settings.clickScrollSpeed);
						});

						// Scroll handle drag
						var isDragging = false;
						var initialY;
						var initialScrollTop;

						$vScrollbarHandle.mousedown(function (e) { });
						
						function getEventY(e) {
							if (e.touches && e.touches.length > 0) {
								return e.touches[0].clientY;
							} else {
								return e.clientY;
							}
						}
						
						$vScrollbarHandle.on("mousedown touchstart", function (e) {
							e.preventDefault();
							
							isDragging = true;
							initialY = getEventY(e);
							initialScrollTop = container.scrollTop();
							
  							$(document).on("mousemove touchmove", drag);
							
							$(document).on("mouseup touchend", function () {
								isDragging = false;
								$(document).off("mousemove touchmove", drag);
							});
						});
						
						function drag(e) {
							e.preventDefault();
							
							if (isDragging) {
								var clientY = getEventY(e);
								var deltaY = clientY-initialY;
								var containerHeight = container.height(); 
								var handleHeight = $vScrollbarHandle.height(); 
								var maxScrollTop = totalChildrenHeight-containerHeight;
								
								// Calculate the new scrollLeft value based on the handle's drag
								var newScrollTop = initialScrollTop+deltaY * (maxScrollTop / (containerHeight-handleHeight));

								// Ensure the new scrollLeft value is within bounds
								newScrollTop = Math.max(0, Math.min(maxScrollTop, newScrollTop));

								// Set the new scrollLeft value
								container.scrollTop(newScrollTop);
							}
						}
						
						// Handle scroll or touch events
						container.on('touchstart touchend mouseenter mouseleave', function (event) {						
							if (event.type === 'mouseenter' || event.type === 'touchstart') {
								$vTrackElm.css({"opacity": 1});
							}
							if (event.type === 'mouseleave' || event.type === 'touchend') {
								$vTrackElm.css({"opacity": settings.scrollBarOpacity});
							}
						});

						$vRailElm.on('touchstart touchend mouseenter mouseleave', function (event) {
							if (event.type === 'mouseenter' || event.type === 'touchstart') {
								$vRailElm.css({"opacity": settings.railHoverOpacity});
							}
							if (event.type === 'mouseleave' || event.type === 'touchend') {
								
								$vRailElm.css({"opacity": settings.railDefaultOpacity});
							}
						});
						
						$vScrollbarHandle.on('touchstart touchend mouseenter mouseleave', function (event) {
							if (event.type === 'mouseenter' || event.type === 'touchstart') {
								$vScrollbarHandle.css({"opacity": settings.handleHoverOpacity});
							}
							if (event.type === 'mouseleave' || event.type === 'touchend') {
								
								$vScrollbarHandle.css({"opacity": settings.handleDefaultOpacity});
							}
						});		
					} 
				}else {
					container.find(".vScrollbarTrack").remove();
				}
			} 
		}
		

		// -------------  Horizontal scrollbar ------------- 
		// Initiate horizontal scroll
		function initHorizontalScrollbar() {
			const children = container.children();
			let totalWidth = 0;

			if (container.prop("scrollWidth") > container.outerWidth()) {
				if (container.css("overflow-x") != "hidden") {
					if (container.isOverflowing("horizontal") != false) {
						if (!container.hasClass("hScroll")) {
							container.addClass("hScroll");
						}

						if (!container.hasClass("noNativeScrollBar")) {
							container.addClass("noNativeScrollBar");
						}	
						
						var paddingTop = parseInt(container.css("padding-top"), 10),
							paddingRight = parseInt(container.css("padding-right"), 10),
							paddingBottom = parseInt(container.css("padding-bottom"), 10),
							paddingLeft = parseInt(container.css("padding-left"), 10);
							
						// Add padding for scrollbar to occuppy
						// 2px extra added for safety 
						if (paddingBottom === settings.scrollWidth + 2) {
							container.css("padding-bottom", settings.scrollWidth+2)
						}
						
						// create the scrollbar element
						var leftArrowSvg = '<svg class="arrow leftArrow" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 492 800" style="enable-background:new 0 0 492 800;" xml:space="preserve"><g><path fill="red" d="M472.9,19c25.4,25.4,25.4,66.6,0,92L184.1,400l288.8,288.9c25.4,25.4,25.4,66.6,0,92.1c-25.4,25.4-66.6,25.4-92.1,0L0,400 L380.9,19.1C406.3-6.3,447.5-6.3,472.9,19z"/></g></svg>';
						var rightArrowSvg = '<svg class="arrow rightArrow" version = "1.1" id = "Capa_1" xmlns = "http://www.w3.org/2000/svg" xmlns: xlink = "http://www.w3.org/1999/xlink" x = "0px" y = "0px" viewBox = "0 0 491.9 800.1" style = "enable-background:new 0 0 491.9 800.1;" xml: space = "preserve" > <g><path d="M111,19.1L491.9,400L111.2,781c-25.5,25.4-66.7,25.4-92.1,0c-25.4-25.5-25.4-66.7,0-92.1L307.8,400L19,111 C-6.3,85.6-6.3,44.4,19,19S85.7-6.4,111,19.1z" /></g></svg>'

						var hTrack = $('<div class="hScrollbarTrack">'+leftArrowSvg+rightArrowSvg+'<div class="ssb hScrollbarRail"></div></div>');
						var hHandle = $('<div class="hScrollbarHandle"></div>');
					
						if (container.find(".hScrollbarTrack").length === 0) {
							hTrack.appendTo(container);
						}


						var $hTrackElm = container.find(".hScrollbarTrack"),
							$hRailElm = container.find(".hScrollbarRail");	
						
						
						// Append the scrollbar handle inside the container
						if ($hRailElm.find(".hScrollbarHandle").length === 0) {
							$hRailElm.append(hHandle);
						}

						var $hScrollbarHandle = $hTrackElm.find(".hScrollbarHandle");		

						$hTrackElm.height();

						var rgbValues = hexToRgb(settings.railBgColor);
						$hTrackElm.css({
							"height": settings.scrollWidth,
							"background-color": "rgba("+rgbValues.red+", "+rgbValues.green+", "+rgbValues.blue+", "+settings.railDefaultOpacity+")",
							"opacity": settings.scrollBarOpacity
						});
						
						$hRailElm.css({
							"opacity": settings.railDefaultOpacity,
							"background-color": settings.railBgColor,
							"border-radius":settings.borderRadius 
						});	

						var contWidth = container.outerWidth(),
							hRightPos = container.position().left,
							arrowWidth = settings.scrollWidth,
							maxWidth = 0,
							maxWidthElm;
													
						maxWidth = container.prop("scrollWidth") - paddingLeft - paddingRight;
						
						var hHandleWidth = 100 * (container.width()/maxWidth);
						
						$hScrollbarHandle.css({
							"width": hHandleWidth + "%",
							"height": settings.scrollWidth,
							"border-radius": settings.borderRadius,
							"background-color": settings.handleBgColor,
							"opacity": settings.handleDefaultOpacity
						});
					
						var	topBorderWidth = container.css('border-top-width'),
							topBorderint = parseFloat(topBorderWidth),
							
							leftBorderWidth = container.css('border-left-width'),
							leftborderInt = parseFloat(leftBorderWidth),
						
							rightBorderWidth = container.css('border-right-width'),
							rightBorderint = parseFloat(rightBorderWidth),
							
						
							bottomBorderWidth = container.css('border-bottom-width'),
							bottomborderInt = parseFloat(bottomBorderWidth)
						
						//-----------------------------------------------------
						// Handle arrows and adjust scroll bar dimensions
						//-----------------------------------------------------
						if (settings.showArrows) { 
							$hTrackElm.width(contWidth-(arrowWidth*2)-leftborderInt-rightBorderint-paddingLeft-paddingRight);

							$hTrackElm.css({
								"left": hRightPos+arrowWidth+leftborderInt+paddingLeft,
								"top": container.position().top - settings.scrollWidth + settings.vOffset + container.outerHeight() - bottomborderInt + "px",
								"border-radius": settings.borderRadius 
							});
						} else {
							$hTrackElm.find(".arrow").hide();

							$hTrackElm.width(contWidth-leftborderInt-rightBorderint-paddingLeft-paddingRight)
							
							$hTrackElm.css({
								"left": hRightPos+leftborderInt+paddingLeft,
								"top": container.position().top-settings.scrollWidth+settings.vOffset+container.outerHeight()-bottomborderInt,
								"border-radius": settings.borderRadius 
							})
							
						}
						//-----------------------------------------------------
						// Set background color for arrows						
						$svg = container.find(".arrow");
						$svg.find('path').attr('fill', settings.railBgColor);

						$hTrackElm.find(".arrow").css({
							// "background-color": settings.railBgColor,
							"opacity": settings.railDefaultOpacity,
							"width": settings.scrollWidth,
						});

						// Set left and right position of the arrows and border-radius
						// NOTE: left arrow is rotated 90deg
						$hTrackElm.find(".leftArrow").css({
							"left": -settings.scrollWidth,
							"border-top-left-radius": settings.borderRadius,
							"border-bottom-left-radius": settings.borderRadius,
							"background-position": "center center" 
						});

						$hTrackElm.find(".rightArrow").css({
							"right": -settings.scrollWidth,
							"border-top-right-radius": settings.borderRadius,
							"border-bottom-right-radius": settings.borderRadius,
							"background-position": "center center" // flipped div
						});
						
						// Hover effects
						$hTrackElm.find(".leftArrow, .rightArrow").hover(
							function() {
								$(this).css({"opacity": 1,})
							},
							function() {
								$(this).css({"opacity": settings.railDefaultOpacity,})
							}
						);
					
						// handle the scroll event of the container
						container.on("scroll", function () {
							const scrollPercentage = container.scrollLeft() / (maxWidth - container.width());
							const handleWidth = $hTrackElm.width() * container.width() / maxWidth;
							
							$hScrollbarHandle.css({
							  left: scrollPercentage * ($hTrackElm.width() - handleWidth),
							  width: handleWidth
							});						
						});
						
						//scroll content on track click (horizontal scroll)	  
						$hRailElm.on("mousedown touchstart", function (e) { //Relative (to its parent) mouse position 
							if (e.target === this) {
								var sPosition = $hScrollbarHandle.position(),
									handlePos;
															
								//settings.scrollWidth added for compensationg arrow width
								handlePos = sPosition.left+settings.scrollWidth * 2;
								console.log("handle_pos", handlePos, "click_pos", e.pageX - container.position().left)
								
								if (handlePos < e.pageX-container.position().left) {
									container.animate({
										scrollLeft: container.scrollLeft()+settings.clickScrollRate
									}, settings.clickScrollSpeed);
								} else if (handlePos > e.pageX - container.position().left) { //settings.scrollWidth added for compensationg arrow width
									container.animate({
										scrollLeft: container.scrollLeft()-settings.clickScrollRate
									}, settings.clickScrollSpeed);
								}
							}
						});
						

						// Arrow click events
						var leftArrow = container.find(".hScrollbarTrack").find(".leftArrow");
						leftArrow.on("mousedown touchstart", function (e) {
							var initialScrollTop = container.scrollLeft();
							container.animate({
								scrollLeft: initialScrollTop-settings.arrowScrollRate
							}, settings.clickScrollSpeed);
						});

						var rightArrow = container.find(".hScrollbarTrack").find(".rightArrow");
						rightArrow.on("mousedown touchstart", function (e) {
							var initialScrollTop = container.scrollLeft();
							container.animate({
								scrollLeft: initialScrollTop+settings.arrowScrollRate
							}, settings.clickScrollSpeed);
						});
			
						// Scroll handle drag
						var isDragging = false;
						var initialX;
						var initialScrollLeft;
						
						$hScrollbarHandle.mousedown(function (e) { });
						
						function getEventX(e) {
							if (e.touches && e.touches.length > 0) {
								return e.touches[0].clientX;
							} else {
								return e.clientX;
							}
						}
						
						$hScrollbarHandle.on("mousedown touchstart", function (e) {
							e.preventDefault();
							
							isDragging = true;
							initialX = getEventX(e);
							initialScrollLeft = container.scrollLeft();
							
  							$(document).on("mousemove touchmove", drag);
							
							$(document).on("mouseup touchend", function () {
								isDragging = false;
								$(document).off("mousemove touchmove", drag);
							});
						});
						
						function drag(e) {
							e.preventDefault();
							
							if (isDragging) {
								var clientX = getEventX(e);
								var deltaX = clientX-initialX;
								var containerWidth = container.width(); 
								var handleWidth = $hScrollbarHandle.width(); 
								var maxScrollLeft = maxWidth - containerWidth;
								
								// Calculate the new scrollLeft value based on the handle's drag
								var newScrollLeft = initialScrollLeft+deltaX * (maxScrollLeft / (containerWidth-handleWidth));

								// Ensure the new scrollLeft value is within bounds
								newScrollLeft = Math.max(0, Math.min(maxScrollLeft, newScrollLeft));

								// Set the new scrollLeft value
								container.scrollLeft(newScrollLeft);
							}
						}

						// Handle scroll or touch events
						container.on('touchstart touchend mouseenter mouseleave', function (event) {					
							if (event.type === 'mouseenter' || event.type === 'touchstart') {
								$hTrackElm.css({"opacity": 1});
							}
							if (event.type === 'mouseleave' || event.type === 'touchend') {
								$hTrackElm.css({"opacity": settings.scrollBarOpacity});
							}
						});

						$hRailElm.on('touchstart touchend mouseenter mouseleave', function (event) {			
							if (event.type === 'mouseenter' || event.type === 'touchstart') {
								$hRailElm.css({"opacity": settings.railHoverOpacity});
							}
							if (event.type === 'mouseleave' || event.type === 'touchend') {
								
								$hRailElm.css({"opacity": settings.railDefaultOpacity});
							}
						});
						
						$hScrollbarHandle.on('touchstart touchend mouseenter mouseleave', function (event) {
							if (event.type === 'mouseenter' || event.type === 'touchstart') {
								$hScrollbarHandle.css({"opacity": settings.handleHoverOpacity});
							}
							if (event.type === 'mouseleave' || event.type === 'touchend') {
								
								$hScrollbarHandle.css({"opacity": settings.handleDefaultOpacity});
							}
						});							
					}
				}
			} else {
				container.find(".hScrollbarTrack").remove();
			}
		}
		
		initVerticalScrollbar();

		initHorizontalScrollbar();

		//resize handler
		const resizeObserver = new ResizeObserver(() => {
			initVerticalScrollbar();
			initHorizontalScrollbar();
		});
		
		resizeObserver.observe(container[0]);
	});
};