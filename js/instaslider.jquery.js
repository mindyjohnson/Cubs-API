

;(function ( $, window, document, undefined ) {

    // Create the defaults once
    var pluginName = "instaSlider",
        defaults = {
            clientID: null,
            access_token: null,
            search: null,
            prevClass: 'prev',
            nextClass: 'next',
            limit: 10,
            duration: 400,
            auto: true,
            delay: 5000
        }

    // The actual plugin constructor
    function Plugin( element, options )
    {
       
        this.element = element;

        this.options = $.extend( {}, defaults, options );

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    Plugin.prototype = {

        init: function() {
            console.log("running instaslider functions INIT");
         
            var self = this;
            self.container = self.element,
            self.$container = $(self.element),
            self.current = 0, // Set current to 0 on initialise
            self.imgWidth = self.$container.width(), // img width will be the same as the container
            self.endpoint = 'https://api.instagram.com/v1/tags/' + this.options.search + '/media/recent?client_id=' + this.options.clientID;
            self.username = '';

            self.createSlider(); // Create the slider

            self.sliderUL = self.$container.find('.instaslider-wrapper ul');

            // If auto is enabled then run auto function
            if (this.options.auto) {
                self.auto();
            }

            var isMatch = self.options.search.substr(0, 1) == "@";

            if (isMatch){
                self.fetchUserFeed();
            } else {
                this.fetchHashtag();
            }

        },

        createSlider: function () {
            // create the slider
            this.$container.append('<div class="instaslider-wrapper"><ul></ul></div>');

            this.createNav();
        },

        createNav: function () {
            var self = this;
            // create the navigation for the slider
            var buttonPrev = '<button class="' + this.options.prevClass + '" data-direction="prev">Prev</button>',
                buttonNext = '<button class="' + this.options.nextClass + '" data-direction="next">Next</button>',
                nav = '<div class="instaslider-nav">' + buttonPrev + buttonNext + '</div>';

            // append it to the container
            this.$container.append(nav);

            // when a button is clicked set current
            this.$container.find('button').on('click', function () {
                self.setCurrent($(this).data('direction'));
                self.transition();
            });
        },

        fetch: function () {
            //fetch images from instagram
            return $.ajax({
                url: this.endpoint,
                data: {},
                dataType: 'jsonp',
                type: 'GET'
            });
        },

        fetchHashtag: function () {
            // create the slides
            var self = this,
                container = this.$container,
                sliderUL = container.find('.instaslider-wrapper ul');

            self.fetch().done(function (results) {
                // Limit the amount of results
                results = self.limit(results.data, self.options.limit);
                // loop over results create a slider for each one.
                self.slides = $.map(results, function (obj, i) {
                    var img = '<li><img src="' + results[i].images.standard_resolution.url + '" /></li>';
                    sliderUL.append(img);
                });
            });

            self.fetch().fail(function () {
                sliderUL.remove();
                container.html('<div class="error"><p>Sorry,<br /> Could not fetch images at this time.</p></div>');
            });

        },

        setCurrent: function (direction) {
            // set the current slide and handle direction here
            var self = this;
            var pos = self.current;
            pos += (~~(direction === 'next') || -1);
            self.current = (pos < 0) ? self.options.limit - 1 : pos % self.options.limit;
            return pos;
        },

        transition: function () {
            // handle animation and slide transition here
            var self = this;

            self.sliderUL.stop().animate({
                'margin-left': -(this.current * this.imgWidth)
            }, self.options.duration);
        },

        auto: function () {
            var self = this;
            setInterval(function() { 
                self.setCurrent('next');
                self.transition();
            }, this.options.delay);
        },

        fetchUserFeed: function() {

            var self = this,
                container = this.$container,
                sliderUL = container.find('.instaslider-wrapper ul');            
            
            // Get the user id from the username first

            this.endpoint = 'https://api.instagram.com/v1/users/search?q='+ self.options.search + '&access_token=' + self.options.access_token;

            this.fetch().done(function(data){

                var userid = data.data[0].id;
                self.endpoint = 'https://api.instagram.com/v1/users/' + userid + '/media/recent?access_token=' + self.options.access_token;

                self.fetch().done(function(results){
                    // Limit the amount of results
                    results = self.limit(results.data, self.options.limit);
                    // loop over results create a slider for each one.
                    self.slides = $.map(results, function (obj, i) {
                        var img = '<li><img src="' + results[i].images.standard_resolution.url + '" /></li>';
                        sliderUL.append(img);
                    });
                });

            });
        },

        limit: function (obj, limit) {
            return obj.slice(0, limit);
        }

    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            new Plugin( this, options );
        });
    };

})( jQuery, window, document );

