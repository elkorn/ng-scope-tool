(function(exports) {
    var bubbles = [];
    var details = $('<section></section>').css({'position': 'absolute','background': 'white'});
    var dTitle = $('<strong></strong>').css('display', 'block');
    details.append(dTitle);
    
    var dList = $('<ul></ul>');
    details.append(dList);
    details.hide();
    
    function clear() {
        $('.watcher--bubble').remove();
        bubbles.forEach(function(bubble) {
            bubble = null;
        });
        
        bubbles = [];
        $("*").css('outline', '0px');
    }
    
    function getWatcherValue(watcher) {
        return typeof (watcher.exp) === 'function' ? JSON.stringify(watcher.exp()) : watcher.exp;
    }
    
    function getRandomColor() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    
    function showDetails(element, watchers, bubble, color) {
        dTitle.text(element.tagName + ' (.' + element.className.replace(/\s/g, '.') + ')');
        dList.children().remove();
        watchers.forEach(function(watcher) {
            var li = $('<li></li>');
            li.text(getWatcherValue(watcher));
            dList.append(li);
        })
        var pos = $(element).offset();
        pos.left += $(bubble).outerWidth();
        details.css(pos).css('padding', '5px');
        details.show();
    }
    
    function hideDetails() {
        details.hide();
    }
    
    function countScopes(elm) {
        var root = $(elm || document.getElementsByTagName('body'));
        var watchers = [];
        var f = function(element) {
            if (element.data().hasOwnProperty('$scope')) {
                var color = getRandomColor();
                var watcher = element.data().$scope;
                if (watchers.indexOf(watcher) === -1) {
                    watchers.push(watcher);
                }
            }
            
            angular.forEach(element.children(), function(childElement) {
                f($(childElement));
            });
        };
        
        f(root);
        return watchers.length;
    }
    function countWatchers(elm) {
        var root = $(elm || document.getElementsByTagName('body'));
        var watchers = [];
        var elements = [];
        
        clear();
        function createWatcherBubble(element, watchers, color) {
            var bubble = document.createElement('span');
            var pos = $(element).offset();
            $(bubble)
            .css('position', 'absolute')
            .css('top', pos.top)
            .css('left', pos.left)
            .css('background', 'white')
            .css('opacity', '0.5')
            .css('padding', '2px')
            .css('outline', '1px solid ' + color)
            .addClass('watcher--bubble')
            .text(watchers.length)
            .on('mouseenter', _.partial(showDetails, element, watchers, bubble, color))
            .on('mouseleave', hideDetails);
            document.body.appendChild(bubble);
            return bubble;
        }
        
        var f = function(element) {
            if (element.data().hasOwnProperty('$scope') && element.data().$scope.$$watchers && element.data().$scope.$$watchers.length) {
                var color = getRandomColor();
                bubbles.push(createWatcherBubble(element[0], element.data().$scope.$$watchers, color));
                angular.forEach(element.data().$scope.$$watchers, function(watcher) {
                    if (watchers.indexOf(watcher) === -1) {
                        watchers.push(watcher);
                        elements.push(element[0]);
                        element
                        .css('outline', '1px solid ' + color);
                    }
                });
            }
            
            angular.forEach(element.children(), function(childElement) {
                f($(childElement));
            });
        };
        
        f(root);
        
        console.clear();
        //  elements.forEach(function(element,index){
        //     console.log(element, watchers[index].last);
        // });
        return watchers.length;
    }
    
    exports.countWatchers = countWatchers;
    exports.countScopes = countScopes;
    exports.clearBubbles = clear;
    console.log(countWatchers());
    $(document.body).append(details);
})(window);
