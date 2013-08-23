if (!jQuery) {
  throw new Error('Bootstrap requires jQuery');
}
+function ($) {
  'use strict';
  function transitionEnd() {
    var el = document.createElement('bootstrap');
    var transEndEventNames = {
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'oTransitionEnd otransitionend',
        'transition': 'transitionend'
      };
    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] };
      }
    }
  }
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false, $el = this;
    $(this).one('webkitTransitionEnd', function () {
      called = true;
    });
    var callback = function () {
      if (!called)
        $($el).trigger('webkitTransitionEnd');
    };
    setTimeout(callback, duration);
    return this;
  };
  $(function () {
    $.support.transition = transitionEnd();
  });
}(window.jQuery);
+function ($) {
  'use strict';
  var dismiss = '[data-dismiss="alert"]';
  var Alert = function (el) {
    $(el).on('click', dismiss, this.close);
  };
  Alert.prototype.close = function (e) {
    var $this = $(this);
    var selector = $this.attr('data-target');
    if (!selector) {
      selector = $this.attr('href');
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '');
    }
    var $parent = $(selector);
    if (e)
      e.preventDefault();
    if (!$parent.length) {
      $parent = $this.hasClass('alert') ? $this : $this.parent();
    }
    $parent.trigger(e = $.Event('close.bs.alert'));
    if (e.isDefaultPrevented())
      return;
    $parent.removeClass('in');
    function removeElement() {
      $parent.trigger('closed.bs.alert').remove();
    }
    $.support.transition && $parent.hasClass('fade') ? $parent.one($.support.transition.end, removeElement).emulateTransitionEnd(150) : removeElement();
  };
  var old = $.fn.alert;
  $.fn.alert = function (option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.alert');
      if (!data)
        $this.data('bs.alert', data = new Alert(this));
      if (typeof option == 'string')
        data[option].call($this);
    });
  };
  $.fn.alert.Constructor = Alert;
  $.fn.alert.noConflict = function () {
    $.fn.alert = old;
    return this;
  };
  $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close);
}(window.jQuery);
+function ($) {
  'use strict';
  var Button = function (element, options) {
    this.$element = $(element);
    this.options = $.extend({}, Button.DEFAULTS, options);
  };
  Button.DEFAULTS = { loadingText: 'loading...' };
  Button.prototype.setState = function (state) {
    var d = 'disabled';
    var $el = this.$element;
    var val = $el.is('input') ? 'val' : 'html';
    var data = $el.data();
    state = state + 'Text';
    if (!data.resetText)
      $el.data('resetText', $el[val]());
    $el[val](data[state] || this.options[state]);
    setTimeout(function () {
      state == 'loadingText' ? $el.addClass(d).attr(d, d) : $el.removeClass(d).removeAttr(d);
    }, 0);
  };
  Button.prototype.toggle = function () {
    var $parent = this.$element.closest('[data-toggle="buttons"]');
    if ($parent.length) {
      var $input = this.$element.find('input').prop('checked', !this.$element.hasClass('active'));
      if ($input.prop('type') === 'radio')
        $parent.find('.active').removeClass('active');
    }
    this.$element.toggleClass('active');
  };
  var old = $.fn.button;
  $.fn.button = function (option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('button');
      var options = typeof option == 'object' && option;
      if (!data)
        $this.data('bs.button', data = new Button(this, options));
      if (option == 'toggle')
        data.toggle();
      else if (option)
        data.setState(option);
    });
  };
  $.fn.button.Constructor = Button;
  $.fn.button.noConflict = function () {
    $.fn.button = old;
    return this;
  };
  $(document).on('click.bs.button.data-api', '[data-toggle^=button]', function (e) {
    var $btn = $(e.target);
    if (!$btn.hasClass('btn'))
      $btn = $btn.closest('.btn');
    $btn.button('toggle');
    e.preventDefault();
  });
}(window.jQuery);
+function ($) {
  'use strict';
  var Carousel = function (element, options) {
    this.$element = $(element);
    this.$indicators = this.$element.find('.carousel-indicators');
    this.options = options;
    this.paused = this.sliding = this.interval = this.$active = this.$items = null;
    this.options.pause == 'hover' && this.$element.on('mouseenter', $.proxy(this.pause, this)).on('mouseleave', $.proxy(this.cycle, this));
  };
  Carousel.DEFAULTS = {
    interval: 5000,
    pause: 'hover'
  };
  Carousel.prototype.cycle = function (e) {
    e || (this.paused = false);
    this.interval && clearInterval(this.interval);
    this.options.interval && !this.paused && (this.interval = setInterval($.proxy(this.next, this), this.options.interval));
    return this;
  };
  Carousel.prototype.getActiveIndex = function () {
    this.$active = this.$element.find('.item.active');
    this.$items = this.$active.parent().children();
    return this.$items.index(this.$active);
  };
  Carousel.prototype.to = function (pos) {
    var that = this;
    var activeIndex = this.getActiveIndex();
    if (pos > this.$items.length - 1 || pos < 0)
      return;
    if (this.sliding)
      return this.$element.one('slid', function () {
        that.to(pos);
      });
    if (activeIndex == pos)
      return this.pause().cycle();
    return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]));
  };
  Carousel.prototype.pause = function (e) {
    e || (this.paused = true);
    if (this.$element.find('.next, .prev').length && $.support.transition.end) {
      this.$element.trigger($.support.transition.end);
      this.cycle(true);
    }
    this.interval = clearInterval(this.interval);
    return this;
  };
  Carousel.prototype.next = function () {
    if (this.sliding)
      return;
    return this.slide('next');
  };
  Carousel.prototype.prev = function () {
    if (this.sliding)
      return;
    return this.slide('prev');
  };
  Carousel.prototype.slide = function (type, next) {
    var $active = this.$element.find('.item.active');
    var $next = next || $active[type]();
    var isCycling = this.interval;
    var direction = type == 'next' ? 'left' : 'right';
    var fallback = type == 'next' ? 'first' : 'last';
    var that = this;
    this.sliding = true;
    isCycling && this.pause();
    $next = $next.length ? $next : this.$element.find('.item')[fallback]();
    var e = $.Event('slide.bs.carousel', {
        relatedTarget: $next[0],
        direction: direction
      });
    if ($next.hasClass('active'))
      return;
    if (this.$indicators.length) {
      this.$indicators.find('.active').removeClass('active');
      this.$element.one('slid', function () {
        var $nextIndicator = $(that.$indicators.children()[that.getActiveIndex()]);
        $nextIndicator && $nextIndicator.addClass('active');
      });
    }
    if ($.support.transition && this.$element.hasClass('slide')) {
      this.$element.trigger(e);
      if (e.isDefaultPrevented())
        return;
      $next.addClass(type);
      $next[0].offsetWidth;
      $active.addClass(direction);
      $next.addClass(direction);
      $active.one($.support.transition.end, function () {
        $next.removeClass([
          type,
          direction
        ].join(' ')).addClass('active');
        $active.removeClass([
          'active',
          direction
        ].join(' '));
        that.sliding = false;
        setTimeout(function () {
          that.$element.trigger('slid');
        }, 0);
      }).emulateTransitionEnd(600);
    } else {
      this.$element.trigger(e);
      if (e.isDefaultPrevented())
        return;
      $active.removeClass('active');
      $next.addClass('active');
      this.sliding = false;
      this.$element.trigger('slid');
    }
    isCycling && this.cycle();
    return this;
  };
  var old = $.fn.carousel;
  $.fn.carousel = function (option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.carousel');
      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option);
      var action = typeof option == 'string' ? option : options.slide;
      if (!data)
        $this.data('bs.carousel', data = new Carousel(this, options));
      if (typeof option == 'number')
        data.to(option);
      else if (action)
        data[action]();
      else if (options.interval)
        data.pause().cycle();
    });
  };
  $.fn.carousel.Constructor = Carousel;
  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old;
    return this;
  };
  $(document).on('click.bs.carousel.data-api', '[data-slide], [data-slide-to]', function (e) {
    var $this = $(this), href;
    var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, ''));
    var options = $.extend({}, $target.data(), $this.data());
    var slideIndex = $this.attr('data-slide-to');
    if (slideIndex)
      options.interval = false;
    $target.carousel(options);
    if (slideIndex = $this.attr('data-slide-to')) {
      $target.data('bs.carousel').to(slideIndex);
    }
    e.preventDefault();
  });
  $(window).on('load', function () {
    $('[data-ride="carousel"]').each(function () {
      var $carousel = $(this);
      $carousel.carousel($carousel.data());
    });
  });
}(window.jQuery);
+function ($) {
  'use strict';
  var Collapse = function (element, options) {
    this.$element = $(element);
    this.options = $.extend({}, Collapse.DEFAULTS, options);
    this.transitioning = null;
    if (this.options.parent)
      this.$parent = $(this.options.parent);
    if (this.options.toggle)
      this.toggle();
  };
  Collapse.DEFAULTS = { toggle: true };
  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width');
    return hasWidth ? 'width' : 'height';
  };
  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in'))
      return;
    var startEvent = $.Event('show.bs.collapse');
    this.$element.trigger(startEvent);
    if (startEvent.isDefaultPrevented())
      return;
    var actives = this.$parent && this.$parent.find('> .accordion-group > .in');
    if (actives && actives.length) {
      var hasData = actives.data('bs.collapse');
      if (hasData && hasData.transitioning)
        return;
      actives.collapse('hide');
      hasData || actives.data('bs.collapse', null);
    }
    var dimension = this.dimension();
    this.$element.removeClass('collapse').addClass('collapsing')[dimension](0);
    this.transitioning = 1;
    var complete = function () {
      this.$element.removeClass('collapsing').addClass('in')[dimension]('auto');
      this.transitioning = 0;
      this.$element.trigger('shown.bs.collapse');
    };
    if (!$.support.transition)
      return complete.call(this);
    var scrollSize = $.camelCase([
        'scroll',
        dimension
      ].join('-'));
    this.$element.one($.support.transition.end, $.proxy(complete, this)).emulateTransitionEnd(350)[dimension](this.$element[0][scrollSize]);
  };
  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in'))
      return;
    var startEvent = $.Event('hide.bs.collapse');
    this.$element.trigger(startEvent);
    if (startEvent.isDefaultPrevented())
      return;
    var dimension = this.dimension();
    this.$element[dimension](this.$element[dimension]())[0].offsetHeight;
    this.$element.addClass('collapsing').removeClass('collapse').removeClass('in');
    this.transitioning = 1;
    var complete = function () {
      this.transitioning = 0;
      this.$element.trigger('hidden.bs.collapse').removeClass('collapsing').addClass('collapse');
    };
    if (!$.support.transition)
      return complete.call(this);
    this.$element[dimension](0).one($.support.transition.end, $.proxy(complete, this)).emulateTransitionEnd(350);
  };
  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']();
  };
  var old = $.fn.collapse;
  $.fn.collapse = function (option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.collapse');
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option);
      if (!data)
        $this.data('bs.collapse', data = new Collapse(this, options));
      if (typeof option == 'string')
        data[option]();
    });
  };
  $.fn.collapse.Constructor = Collapse;
  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old;
    return this;
  };
  $(document).on('click.bs.collapse.data-api', '[data-toggle=collapse]', function (e) {
    var $this = $(this), href;
    var target = $this.attr('data-target') || e.preventDefault() || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '');
    var $target = $(target);
    var data = $target.data('bs.collapse');
    var option = data ? 'toggle' : $this.data();
    var parent = $this.attr('data-parent');
    var $parent = parent && $(parent);
    if (!data || !data.transitioning) {
      if ($parent)
        $parent.find('[data-toggle=collapse][data-parent=' + parent + ']').not($this).addClass('collapsed');
      $this[$target.hasClass('in') ? 'addClass' : 'removeClass']('collapsed');
    }
    $target.collapse(option);
  });
}(window.jQuery);
+function ($) {
  'use strict';
  var backdrop = '.dropdown-backdrop';
  var toggle = '[data-toggle=dropdown]';
  var Dropdown = function (element) {
    var $el = $(element).on('click.bs.dropdown', this.toggle);
  };
  Dropdown.prototype.toggle = function (e) {
    var $this = $(this);
    if ($this.is('.disabled, :disabled'))
      return;
    var $parent = getParent($this);
    var isActive = $parent.hasClass('open');
    clearMenus();
    if (!isActive) {
      if ('ontouchstart' in document.documentElement) {
        $('<div class="dropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus);
      }
      $parent.trigger(e = $.Event('show.bs.dropdown'));
      if (e.isDefaultPrevented())
        return;
      $parent.toggleClass('open').trigger('shown.bs.dropdown');
    }
    $this.focus();
    return false;
  };
  Dropdown.prototype.keydown = function (e) {
    if (!/(38|40|27)/.test(e.keyCode))
      return;
    var $this = $(this);
    e.preventDefault();
    e.stopPropagation();
    if ($this.is('.disabled, :disabled'))
      return;
    var $parent = getParent($this);
    var isActive = $parent.hasClass('open');
    if (!isActive || isActive && e.keyCode == 27) {
      if (e.which == 27)
        $parent.find(toggle).focus();
      return $this.click();
    }
    var $items = $('[role=menu] li:not(.divider):visible a', $parent);
    if (!$items.length)
      return;
    var index = $items.index($items.filter(':focus'));
    if (e.keyCode == 38 && index > 0)
      index--;
    if (e.keyCode == 40 && index < $items.length - 1)
      index++;
    if (!~index)
      index = 0;
    $items.eq(index).focus();
  };
  function clearMenus() {
    $(backdrop).remove();
    $(toggle).each(function (e) {
      var $parent = getParent($(this));
      if (!$parent.hasClass('open'))
        return;
      $parent.trigger(e = $.Event('hide.bs.dropdown'));
      if (e.isDefaultPrevented())
        return;
      $parent.removeClass('open').trigger('hidden.bs.dropdown');
    });
  }
  function getParent($this) {
    var selector = $this.attr('data-target');
    if (!selector) {
      selector = $this.attr('href');
      selector = selector && /#/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '');
    }
    var $parent = selector && $(selector);
    return $parent && $parent.length ? $parent : $this.parent();
  }
  var old = $.fn.dropdown;
  $.fn.dropdown = function (option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('dropdown');
      if (!data)
        $this.data('dropdown', data = new Dropdown(this));
      if (typeof option == 'string')
        data[option].call($this);
    });
  };
  $.fn.dropdown.Constructor = Dropdown;
  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old;
    return this;
  };
  $(document).on('click.bs.dropdown.data-api', clearMenus).on('click.bs.dropdown.data-api', '.dropdown form', function (e) {
    e.stopPropagation();
  }).on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle).on('keydown.bs.dropdown.data-api', toggle + ', [role=menu]', Dropdown.prototype.keydown);
}(window.jQuery);
+function ($) {
  'use strict';
  var Modal = function (element, options) {
    this.options = options;
    this.$element = $(element).on('click.dismiss.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this));
    this.$backdrop = this.isShown = null;
    if (this.options.remote)
      this.$element.find('.modal-body').load(this.options.remote);
  };
  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  };
  Modal.prototype.toggle = function () {
    return this[!this.isShown ? 'show' : 'hide']();
  };
  Modal.prototype.show = function () {
    var that = this;
    var e = $.Event('show.bs.modal');
    this.$element.trigger(e);
    if (this.isShown || e.isDefaultPrevented())
      return;
    this.isShown = true;
    this.escape();
    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade');
      if (!that.$element.parent().length) {
        that.$element.appendTo(document.body);
      }
      that.$element.show();
      if (transition) {
        that.$element[0].offsetWidth;
      }
      that.$element.addClass('in').attr('aria-hidden', false);
      that.enforceFocus();
      transition ? that.$element.one($.support.transition.end, function () {
        that.$element.focus().trigger('shown.bs.modal');
      }).emulateTransitionEnd(300) : that.$element.focus().trigger('shown.bs.modal');
    });
  };
  Modal.prototype.hide = function (e) {
    if (e)
      e.preventDefault();
    e = $.Event('hide.bs.modal');
    this.$element.trigger(e);
    if (!this.isShown || e.isDefaultPrevented())
      return;
    this.isShown = false;
    this.escape();
    $(document).off('focusin.bs.modal');
    this.$element.removeClass('in').attr('aria-hidden', true);
    $.support.transition && this.$element.hasClass('fade') ? this.$element.one($.support.transition.end, $.proxy(this.hideModal, this)).emulateTransitionEnd(300) : this.hideModal();
  };
  Modal.prototype.enforceFocus = function () {
    $(document).off('focusin.bs.modal').on('focusin.bs.modal', $.proxy(function (e) {
      if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
        this.$element.focus();
      }
    }, this));
  };
  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keyup.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide();
      }, this));
    } else if (!this.isShown) {
      this.$element.off('keyup.dismiss.bs.modal');
    }
  };
  Modal.prototype.hideModal = function () {
    var that = this;
    this.$element.hide();
    this.backdrop(function () {
      that.removeBackdrop();
      that.$element.trigger('hidden.bs.modal');
    });
  };
  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove();
    this.$backdrop = null;
  };
  Modal.prototype.backdrop = function (callback) {
    var that = this;
    var animate = this.$element.hasClass('fade') ? 'fade' : '';
    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate;
      this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />').appendTo(document.body);
      this.$element.on('click', $.proxy(function (e) {
        if (e.target !== e.currentTarget)
          return;
        this.options.backdrop == 'static' ? this.$element[0].focus.call(this.$element[0]) : this.hide.call(this);
      }, this));
      if (doAnimate)
        this.$backdrop[0].offsetWidth;
      this.$backdrop.addClass('in');
      if (!callback)
        return;
      doAnimate ? this.$backdrop.one($.support.transition.end, callback).emulateTransitionEnd(150) : callback();
    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in');
      $.support.transition && this.$element.hasClass('fade') ? this.$backdrop.one($.support.transition.end, callback).emulateTransitionEnd(150) : callback();
    } else if (callback) {
      callback();
    }
  };
  var old = $.fn.modal;
  $.fn.modal = function (option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.modal');
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option);
      if (!data)
        $this.data('bs.modal', data = new Modal(this, options));
      if (typeof option == 'string')
        data[option]();
      else if (options.show)
        data.show();
    });
  };
  $.fn.modal.Constructor = Modal;
  $.fn.modal.noConflict = function () {
    $.fn.modal = old;
    return this;
  };
  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this = $(this);
    var href = $this.attr('href');
    var $target = $($this.attr('data-target') || href && href.replace(/.*(?=#[^\s]+$)/, ''));
    var option = $target.data('modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data());
    e.preventDefault();
    $target.modal(option).one('hide', function () {
      $this.is(':visible') && $this.focus();
    });
  });
  var $body = $(document.body).on('shown.bs.modal', '.modal', function () {
      $body.addClass('modal-open');
    }).on('hidden.bs.modal', '.modal', function () {
      $body.removeClass('modal-open');
    });
}(window.jQuery);
+function ($) {
  'use strict';
  var Tooltip = function (element, options) {
    this.type = this.options = this.enabled = this.timeout = this.hoverState = this.$element = null;
    this.init('tooltip', element, options);
  };
  Tooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
    template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false
  };
  Tooltip.prototype.init = function (type, element, options) {
    this.enabled = true;
    this.type = type;
    this.$element = $(element);
    this.options = this.getOptions(options);
    var triggers = this.options.trigger.split(' ');
    for (var i = triggers.length; i--;) {
      var trigger = triggers[i];
      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this));
      } else if (trigger != 'manual') {
        var eventIn = trigger == 'hover' ? 'mouseenter' : 'focus';
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'blur';
        this.$element.on(eventIn + '.' + this.type, this.options.selector, $.proxy(this.enter, this));
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this));
      }
    }
    this.options.selector ? this._options = $.extend({}, this.options, {
      trigger: 'manual',
      selector: ''
    }) : this.fixTitle();
  };
  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS;
  };
  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options);
    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay
      };
    }
    return options;
  };
  Tooltip.prototype.enter = function (obj) {
    var defaults = this.getDefaults();
    var options = {};
    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value)
        options[key] = value;
    });
    var self = obj instanceof this.constructor ? obj : $(obj.currentTarget)[this.type](options).data('bs.' + this.type);
    clearTimeout(self.timeout);
    if (!self.options.delay || !self.options.delay.show)
      return self.show();
    self.hoverState = 'in';
    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in')
        self.show();
    }, self.options.delay.show);
  };
  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ? obj : $(obj.currentTarget)[this.type](this._options).data('bs.' + this.type);
    clearTimeout(self.timeout);
    if (!self.options.delay || !self.options.delay.hide)
      return self.hide();
    self.hoverState = 'out';
    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out')
        self.hide();
    }, self.options.delay.hide);
  };
  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.' + this.type);
    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e);
      if (e.isDefaultPrevented())
        return;
      var $tip = this.tip();
      this.setContent();
      if (this.options.animation)
        $tip.addClass('fade');
      var placement = typeof this.options.placement == 'function' ? this.options.placement.call(this, $tip[0], this.$element[0]) : this.options.placement;
      var autoToken = /\s?auto?\s?/i;
      var autoPlace = autoToken.test(placement);
      if (autoPlace)
        placement = placement.replace(autoToken, '') || 'top';
      $tip.detach().css({
        top: 0,
        left: 0,
        display: 'block'
      }).addClass(placement);
      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element);
      var pos = this.getPosition();
      var actualWidth = $tip[0].offsetWidth;
      var actualHeight = $tip[0].offsetHeight;
      if (autoPlace) {
        var $parent = this.$element.parent();
        var orgPlacement = placement;
        var docScroll = document.documentElement.scrollTop || document.body.scrollTop;
        var parentWidth = this.options.container == 'body' ? window.innerWidth : $parent.outerWidth();
        var parentHeight = this.options.container == 'body' ? window.innerHeight : $parent.outerHeight();
        var parentLeft = this.options.container == 'body' ? 0 : $parent.offset().left;
        placement = placement == 'bottom' && pos.top + pos.height + actualHeight - docScroll > parentHeight ? 'top' : placement == 'top' && pos.top - docScroll - actualHeight < 0 ? 'bottom' : placement == 'right' && pos.right + actualWidth > parentWidth ? 'left' : placement == 'left' && pos.left - actualWidth < parentLeft ? 'right' : placement;
        $tip.removeClass(orgPlacement).addClass(placement);
      }
      var tp = placement == 'bottom' ? {
          top: pos.top + pos.height,
          left: pos.left + pos.width / 2 - actualWidth / 2
        } : placement == 'top' ? {
          top: pos.top - actualHeight,
          left: pos.left + pos.width / 2 - actualWidth / 2
        } : placement == 'left' ? {
          top: pos.top + pos.height / 2 - actualHeight / 2,
          left: pos.left - actualWidth
        } : {
          top: pos.top + pos.height / 2 - actualHeight / 2,
          left: pos.left + pos.width
        };
      this.applyPlacement(tp, placement);
      this.$element.trigger('shown.bs.' + this.type);
    }
  };
  Tooltip.prototype.applyPlacement = function (offset, placement) {
    var replace;
    var $tip = this.tip();
    var width = $tip[0].offsetWidth;
    var height = $tip[0].offsetHeight;
    offset.top = offset.top + parseInt($tip.css('margin-top'), 10);
    offset.left = offset.left + parseInt($tip.css('margin-left'), 10);
    $tip.offset(offset).addClass('in');
    var actualWidth = $tip[0].offsetWidth;
    var actualHeight = $tip[0].offsetHeight;
    if (placement == 'top' && actualHeight != height) {
      replace = true;
      offset.top = offset.top + height - actualHeight;
    }
    if (placement == 'bottom' || placement == 'top') {
      var delta = 0;
      if (offset.left < 0) {
        delta = offset.left * -2;
        offset.left = 0;
        $tip.offset(offset);
        actualWidth = $tip[0].offsetWidth;
        actualHeight = $tip[0].offsetHeight;
      }
      this.replaceArrow(delta - width + actualWidth, actualWidth, 'left');
    } else {
      this.replaceArrow(actualHeight - height, actualHeight, 'top');
    }
    if (replace)
      $tip.offset(offset);
  };
  Tooltip.prototype.replaceArrow = function (delta, dimension, position) {
    this.arrow().css(position, delta ? 50 * (1 - delta / dimension) + '%' : '');
  };
  Tooltip.prototype.setContent = function () {
    var $tip = this.tip();
    var title = this.getTitle();
    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title);
    $tip.removeClass('fade in top bottom left right');
  };
  Tooltip.prototype.hide = function () {
    var that = this;
    var $tip = this.tip();
    var e = $.Event('hide.bs.' + this.type);
    this.$element.trigger(e);
    if (e.isDefaultPrevented())
      return;
    $tip.removeClass('in');
    $.support.transition && this.$tip.hasClass('fade') ? $tip.one($.support.transition.end, $tip.detach).emulateTransitionEnd(150) : $tip.detach();
    this.$element.trigger('hidden.bs.' + this.type);
    return this;
  };
  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element;
    if ($e.attr('title') || typeof $e.attr('data-original-title') != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '');
    }
  };
  Tooltip.prototype.hasContent = function () {
    return this.getTitle();
  };
  Tooltip.prototype.getPosition = function () {
    var el = this.$element[0];
    return $.extend({}, typeof el.getBoundingClientRect == 'function' ? el.getBoundingClientRect() : {
      width: el.offsetWidth,
      height: el.offsetHeight
    }, this.$element.offset());
  };
  Tooltip.prototype.getTitle = function () {
    var title;
    var $e = this.$element;
    var o = this.options;
    title = $e.attr('data-original-title') || (typeof o.title == 'function' ? o.title.call($e[0]) : o.title);
    return title;
  };
  Tooltip.prototype.tip = function () {
    return this.$tip = this.$tip || $(this.options.template);
  };
  Tooltip.prototype.arrow = function () {
    return this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow');
  };
  Tooltip.prototype.validate = function () {
    if (!this.$element[0].parentNode) {
      this.hide();
      this.$element = null;
      this.options = null;
    }
  };
  Tooltip.prototype.enable = function () {
    this.enabled = true;
  };
  Tooltip.prototype.disable = function () {
    this.enabled = false;
  };
  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled;
  };
  Tooltip.prototype.toggle = function (e) {
    var self = e ? $(e.currentTarget)[this.type](this._options).data('bs.' + this.type) : this;
    self.tip().hasClass('in') ? self.leave(self) : self.enter(self);
  };
  Tooltip.prototype.destroy = function () {
    this.hide().$element.off('.' + this.type).removeData('bs.' + this.type);
  };
  var old = $.fn.tooltip;
  $.fn.tooltip = function (option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.tooltip');
      var options = typeof option == 'object' && option;
      if (!data)
        $this.data('bs.tooltip', data = new Tooltip(this, options));
      if (typeof option == 'string')
        data[option]();
    });
  };
  $.fn.tooltip.Constructor = Tooltip;
  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old;
    return this;
  };
}(window.jQuery);
+function ($) {
  'use strict';
  var Popover = function (element, options) {
    this.init('popover', element, options);
  };
  if (!$.fn.tooltip)
    throw new Error('Popover requires tooltip.js');
  Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
  });
  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype);
  Popover.prototype.constructor = Popover;
  Popover.prototype.getDefaults = function () {
    return Popover.DEFAULTS;
  };
  Popover.prototype.setContent = function () {
    var $tip = this.tip();
    var title = this.getTitle();
    var content = this.getContent();
    $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title);
    $tip.find('.popover-content')[this.options.html ? 'html' : 'text'](content);
    $tip.removeClass('fade top bottom left right in');
    $tip.find('.popover-title:empty').hide();
  };
  Popover.prototype.hasContent = function () {
    return this.getTitle() || this.getContent();
  };
  Popover.prototype.getContent = function () {
    var $e = this.$element;
    var o = this.options;
    return $e.attr('data-content') || (typeof o.content == 'function' ? o.content.call($e[0]) : o.content);
  };
  Popover.prototype.tip = function () {
    if (!this.$tip)
      this.$tip = $(this.options.template);
    return this.$tip;
  };
  Popover.prototype.destroy = function () {
    this.hide().$element.off('.' + this.type).removeData(this.type);
  };
  var old = $.fn.popover;
  $.fn.popover = function (option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.popover');
      var options = typeof option == 'object' && option;
      if (!data)
        $this.data('bs.popover', data = new Popover(this, options));
      if (typeof option == 'string')
        data[option]();
    });
  };
  $.fn.popover.Constructor = Popover;
  $.fn.popover.noConflict = function () {
    $.fn.popover = old;
    return this;
  };
}(window.jQuery);
+function ($) {
  'use strict';
  function ScrollSpy(element, options) {
    var href;
    var process = $.proxy(this.process, this);
    this.$element = $(element).is('body') ? $(window) : $(element);
    this.$body = $('body');
    this.$scrollElement = this.$element.on('scroll.bs.scroll-spy.data-api', process);
    this.options = $.extend({}, ScrollSpy.DEFAULTS, options);
    this.selector = (this.options.target || (href = $(element).attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') || '') + ' .nav li > a';
    this.offsets = $([]);
    this.targets = $([]);
    this.activeTarget = null;
    this.refresh();
    this.process();
  }
  ScrollSpy.DEFAULTS = { offset: 10 };
  ScrollSpy.prototype.refresh = function () {
    var offsetMethod = this.$element[0] == window ? 'offset' : 'position';
    this.offsets = $([]);
    this.targets = $([]);
    var self = this;
    var $targets = this.$body.find(this.selector).map(function () {
        var $el = $(this);
        var href = $el.data('target') || $el.attr('href');
        var $href = /^#\w/.test(href) && $(href);
        return $href && $href.length && [[
            $href[offsetMethod]().top + (!$.isWindow(self.$scrollElement.get(0)) && self.$scrollElement.scrollTop()),
            href
          ]] || null;
      }).sort(function (a, b) {
        return a[0] - b[0];
      }).each(function () {
        self.offsets.push(this[0]);
        self.targets.push(this[1]);
      });
  };
  ScrollSpy.prototype.process = function () {
    var scrollTop = this.$scrollElement.scrollTop() + this.options.offset;
    var scrollHeight = this.$scrollElement[0].scrollHeight || this.$body[0].scrollHeight;
    var maxScroll = scrollHeight - this.$scrollElement.height();
    var offsets = this.offsets;
    var targets = this.targets;
    var activeTarget = this.activeTarget;
    var i;
    if (scrollTop >= maxScroll) {
      return activeTarget != (i = targets.last()[0]) && this.activate(i);
    }
    for (i = offsets.length; i--;) {
      activeTarget != targets[i] && scrollTop >= offsets[i] && (!offsets[i + 1] || scrollTop <= offsets[i + 1]) && this.activate(targets[i]);
    }
  };
  ScrollSpy.prototype.activate = function (target) {
    this.activeTarget = target;
    $(this.selector).parents('.active').removeClass('active');
    var selector = this.selector + '[data-target="' + target + '"],' + this.selector + '[href="' + target + '"]';
    var active = $(selector).parents('li').addClass('active');
    if (active.parent('.dropdown-menu').length) {
      active = active.closest('li.dropdown').addClass('active');
    }
    active.trigger('activate');
  };
  var old = $.fn.scrollspy;
  $.fn.scrollspy = function (option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.scrollspy');
      var options = typeof option == 'object' && option;
      if (!data)
        $this.data('bs.scrollspy', data = new ScrollSpy(this, options));
      if (typeof option == 'string')
        data[option]();
    });
  };
  $.fn.scrollspy.Constructor = ScrollSpy;
  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old;
    return this;
  };
  $(window).on('load', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this);
      $spy.scrollspy($spy.data());
    });
  });
}(window.jQuery);
+function ($) {
  'use strict';
  var Tab = function (element) {
    this.element = $(element);
  };
  Tab.prototype.show = function () {
    var $this = this.element;
    var $ul = $this.closest('ul:not(.dropdown-menu)');
    var selector = $this.attr('data-target');
    if (!selector) {
      selector = $this.attr('href');
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '');
    }
    if ($this.parent('li').hasClass('active'))
      return;
    var previous = $ul.find('.active:last a')[0];
    var e = $.Event('show.bs.tab', { relatedTarget: previous });
    $this.trigger(e);
    if (e.isDefaultPrevented())
      return;
    var $target = $(selector);
    this.activate($this.parent('li'), $ul);
    this.activate($target, $target.parent(), function () {
      $this.trigger({
        type: 'shown.bs.tab',
        relatedTarget: previous
      });
    });
  };
  Tab.prototype.activate = function (element, container, callback) {
    var $active = container.find('> .active');
    var transition = callback && $.support.transition && $active.hasClass('fade');
    function next() {
      $active.removeClass('active').find('> .dropdown-menu > .active').removeClass('active');
      element.addClass('active');
      if (transition) {
        element[0].offsetWidth;
        element.addClass('in');
      } else {
        element.removeClass('fade');
      }
      if (element.parent('.dropdown-menu')) {
        element.closest('li.dropdown').addClass('active');
      }
      callback && callback();
    }
    transition ? $active.one($.support.transition.end, next).emulateTransitionEnd(150) : next();
    $active.removeClass('in');
  };
  var old = $.fn.tab;
  $.fn.tab = function (option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.tab');
      if (!data)
        $this.data('bs.tab', data = new Tab(this));
      if (typeof option == 'string')
        data[option]();
    });
  };
  $.fn.tab.Constructor = Tab;
  $.fn.tab.noConflict = function () {
    $.fn.tab = old;
    return this;
  };
  $(document).on('click.bs.tab.data-api', '[data-toggle="tab"], [data-toggle="pill"]', function (e) {
    e.preventDefault();
    $(this).tab('show');
  });
}(window.jQuery);
+function ($) {
  'use strict';
  var Affix = function (element, options) {
    this.options = $.extend({}, Affix.DEFAULTS, options);
    this.$window = $(window).on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this)).on('click.bs.affix.data-api', $.proxy(this.checkPositionWithEventLoop, this));
    this.$element = $(element);
    this.affixed = this.unpin = null;
    this.checkPosition();
  };
  Affix.RESET = 'affix affix-top affix-bottom';
  Affix.DEFAULTS = { offset: 0 };
  Affix.prototype.checkPositionWithEventLoop = function () {
    setTimeout($.proxy(this.checkPosition, this), 1);
  };
  Affix.prototype.checkPosition = function () {
    if (!this.$element.is(':visible'))
      return;
    var scrollHeight = $(document).height();
    var scrollTop = this.$window.scrollTop();
    var position = this.$element.offset();
    var offset = this.options.offset;
    var offsetTop = offset.top;
    var offsetBottom = offset.bottom;
    if (typeof offset != 'object')
      offsetBottom = offsetTop = offset;
    if (typeof offsetTop == 'function')
      offsetTop = offset.top();
    if (typeof offsetBottom == 'function')
      offsetBottom = offset.bottom();
    var affix = this.unpin != null && scrollTop + this.unpin <= position.top ? false : offsetBottom != null && position.top + this.$element.height() >= scrollHeight - offsetBottom ? 'bottom' : offsetTop != null && scrollTop <= offsetTop ? 'top' : false;
    if (this.affixed === affix)
      return;
    if (this.unpin)
      this.$element.css('top', '');
    this.affixed = affix;
    this.unpin = affix == 'bottom' ? position.top - scrollTop : null;
    this.$element.removeClass(Affix.RESET).addClass('affix' + (affix ? '-' + affix : ''));
    if (affix == 'bottom') {
      this.$element.offset({ top: document.body.offsetHeight - offsetBottom - this.$element.height() });
    }
  };
  var old = $.fn.affix;
  $.fn.affix = function (option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.affix');
      var options = typeof option == 'object' && option;
      if (!data)
        $this.data('bs.affix', data = new Affix(this, options));
      if (typeof option == 'string')
        data[option]();
    });
  };
  $.fn.affix.Constructor = Affix;
  $.fn.affix.noConflict = function () {
    $.fn.affix = old;
    return this;
  };
  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this);
      var data = $spy.data();
      data.offset = data.offset || {};
      if (data.offsetBottom)
        data.offset.bottom = data.offsetBottom;
      if (data.offsetTop)
        data.offset.top = data.offsetTop;
      $spy.affix(data);
    });
  });
}(window.jQuery);
(function ($) {
  var VERSION = '0.9.3';
  var utils = {
      isMsie: function () {
        var match = /(msie) ([\w.]+)/i.exec(navigator.userAgent);
        return match ? parseInt(match[2], 10) : false;
      },
      isBlankString: function (str) {
        return !str || /^\s*$/.test(str);
      },
      escapeRegExChars: function (str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
      },
      isString: function (obj) {
        return typeof obj === 'string';
      },
      isNumber: function (obj) {
        return typeof obj === 'number';
      },
      isArray: $.isArray,
      isFunction: $.isFunction,
      isObject: $.isPlainObject,
      isUndefined: function (obj) {
        return typeof obj === 'undefined';
      },
      bind: $.proxy,
      bindAll: function (obj) {
        var val;
        for (var key in obj) {
          $.isFunction(val = obj[key]) && (obj[key] = $.proxy(val, obj));
        }
      },
      indexOf: function (haystack, needle) {
        for (var i = 0; i < haystack.length; i++) {
          if (haystack[i] === needle) {
            return i;
          }
        }
        return -1;
      },
      each: $.each,
      map: $.map,
      filter: $.grep,
      every: function (obj, test) {
        var result = true;
        if (!obj) {
          return result;
        }
        $.each(obj, function (key, val) {
          if (!(result = test.call(null, val, key, obj))) {
            return false;
          }
        });
        return !!result;
      },
      some: function (obj, test) {
        var result = false;
        if (!obj) {
          return result;
        }
        $.each(obj, function (key, val) {
          if (result = test.call(null, val, key, obj)) {
            return false;
          }
        });
        return !!result;
      },
      mixin: $.extend,
      getUniqueId: function () {
        var counter = 0;
        return function () {
          return counter++;
        };
      }(),
      defer: function (fn) {
        setTimeout(fn, 0);
      },
      debounce: function (func, wait, immediate) {
        var timeout, result;
        return function () {
          var context = this, args = arguments, later, callNow;
          later = function () {
            timeout = null;
            if (!immediate) {
              result = func.apply(context, args);
            }
          };
          callNow = immediate && !timeout;
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
          if (callNow) {
            result = func.apply(context, args);
          }
          return result;
        };
      },
      throttle: function (func, wait) {
        var context, args, timeout, result, previous, later;
        previous = 0;
        later = function () {
          previous = new Date();
          timeout = null;
          result = func.apply(context, args);
        };
        return function () {
          var now = new Date(), remaining = wait - (now - previous);
          context = this;
          args = arguments;
          if (remaining <= 0) {
            clearTimeout(timeout);
            timeout = null;
            previous = now;
            result = func.apply(context, args);
          } else if (!timeout) {
            timeout = setTimeout(later, remaining);
          }
          return result;
        };
      },
      tokenizeQuery: function (str) {
        return $.trim(str).toLowerCase().split(/[\s]+/);
      },
      tokenizeText: function (str) {
        return $.trim(str).toLowerCase().split(/[\s\-_]+/);
      },
      getProtocol: function () {
        return location.protocol;
      },
      noop: function () {
      }
    };
  var EventTarget = function () {
      var eventSplitter = /\s+/;
      return {
        on: function (events, callback) {
          var event;
          if (!callback) {
            return this;
          }
          this._callbacks = this._callbacks || {};
          events = events.split(eventSplitter);
          while (event = events.shift()) {
            this._callbacks[event] = this._callbacks[event] || [];
            this._callbacks[event].push(callback);
          }
          return this;
        },
        trigger: function (events, data) {
          var event, callbacks;
          if (!this._callbacks) {
            return this;
          }
          events = events.split(eventSplitter);
          while (event = events.shift()) {
            if (callbacks = this._callbacks[event]) {
              for (var i = 0; i < callbacks.length; i += 1) {
                callbacks[i].call(this, {
                  type: event,
                  data: data
                });
              }
            }
          }
          return this;
        }
      };
    }();
  var EventBus = function () {
      var namespace = 'typeahead:';
      function EventBus(o) {
        if (!o || !o.el) {
          $.error('EventBus initialized without el');
        }
        this.$el = $(o.el);
      }
      utils.mixin(EventBus.prototype, {
        trigger: function (type) {
          var args = [].slice.call(arguments, 1);
          this.$el.trigger(namespace + type, args);
        }
      });
      return EventBus;
    }();
  var PersistentStorage = function () {
      var ls, methods;
      try {
        ls = window.localStorage;
        ls.setItem('~~~', '!');
        ls.removeItem('~~~');
      } catch (err) {
        ls = null;
      }
      function PersistentStorage(namespace) {
        this.prefix = [
          '__',
          namespace,
          '__'
        ].join('');
        this.ttlKey = '__ttl__';
        this.keyMatcher = new RegExp('^' + this.prefix);
      }
      if (ls && window.JSON) {
        methods = {
          _prefix: function (key) {
            return this.prefix + key;
          },
          _ttlKey: function (key) {
            return this._prefix(key) + this.ttlKey;
          },
          get: function (key) {
            if (this.isExpired(key)) {
              this.remove(key);
            }
            return decode(ls.getItem(this._prefix(key)));
          },
          set: function (key, val, ttl) {
            if (utils.isNumber(ttl)) {
              ls.setItem(this._ttlKey(key), encode(now() + ttl));
            } else {
              ls.removeItem(this._ttlKey(key));
            }
            return ls.setItem(this._prefix(key), encode(val));
          },
          remove: function (key) {
            ls.removeItem(this._ttlKey(key));
            ls.removeItem(this._prefix(key));
            return this;
          },
          clear: function () {
            var i, key, keys = [], len = ls.length;
            for (i = 0; i < len; i++) {
              if ((key = ls.key(i)).match(this.keyMatcher)) {
                keys.push(key.replace(this.keyMatcher, ''));
              }
            }
            for (i = keys.length; i--;) {
              this.remove(keys[i]);
            }
            return this;
          },
          isExpired: function (key) {
            var ttl = decode(ls.getItem(this._ttlKey(key)));
            return utils.isNumber(ttl) && now() > ttl ? true : false;
          }
        };
      } else {
        methods = {
          get: utils.noop,
          set: utils.noop,
          remove: utils.noop,
          clear: utils.noop,
          isExpired: utils.noop
        };
      }
      utils.mixin(PersistentStorage.prototype, methods);
      return PersistentStorage;
      function now() {
        return new Date().getTime();
      }
      function encode(val) {
        return JSON.stringify(utils.isUndefined(val) ? null : val);
      }
      function decode(val) {
        return JSON.parse(val);
      }
    }();
  var RequestCache = function () {
      function RequestCache(o) {
        utils.bindAll(this);
        o = o || {};
        this.sizeLimit = o.sizeLimit || 10;
        this.cache = {};
        this.cachedKeysByAge = [];
      }
      utils.mixin(RequestCache.prototype, {
        get: function (url) {
          return this.cache[url];
        },
        set: function (url, resp) {
          var requestToEvict;
          if (this.cachedKeysByAge.length === this.sizeLimit) {
            requestToEvict = this.cachedKeysByAge.shift();
            delete this.cache[requestToEvict];
          }
          this.cache[url] = resp;
          this.cachedKeysByAge.push(url);
        }
      });
      return RequestCache;
    }();
  var Transport = function () {
      var pendingRequestsCount = 0, pendingRequests = {}, maxPendingRequests, requestCache;
      function Transport(o) {
        utils.bindAll(this);
        o = utils.isString(o) ? { url: o } : o;
        requestCache = requestCache || new RequestCache();
        maxPendingRequests = utils.isNumber(o.maxParallelRequests) ? o.maxParallelRequests : maxPendingRequests || 6;
        this.url = o.url;
        this.wildcard = o.wildcard || '%QUERY';
        this.filter = o.filter;
        this.replace = o.replace;
        this.ajaxSettings = {
          type: 'get',
          cache: o.cache,
          timeout: o.timeout,
          dataType: o.dataType || 'json',
          beforeSend: o.beforeSend
        };
        this._get = (/^throttle$/i.test(o.rateLimitFn) ? utils.throttle : utils.debounce)(this._get, o.rateLimitWait || 300);
      }
      utils.mixin(Transport.prototype, {
        _get: function (url, cb) {
          var that = this;
          if (belowPendingRequestsThreshold()) {
            this._sendRequest(url).done(done);
          } else {
            this.onDeckRequestArgs = [].slice.call(arguments, 0);
          }
          function done(resp) {
            var data = that.filter ? that.filter(resp) : resp;
            cb && cb(data);
            requestCache.set(url, resp);
          }
        },
        _sendRequest: function (url) {
          var that = this, jqXhr = pendingRequests[url];
          if (!jqXhr) {
            incrementPendingRequests();
            jqXhr = pendingRequests[url] = $.ajax(url, this.ajaxSettings).always(always);
          }
          return jqXhr;
          function always() {
            decrementPendingRequests();
            pendingRequests[url] = null;
            if (that.onDeckRequestArgs) {
              that._get.apply(that, that.onDeckRequestArgs);
              that.onDeckRequestArgs = null;
            }
          }
        },
        get: function (query, cb) {
          var that = this, encodedQuery = encodeURIComponent(query || ''), url, resp;
          cb = cb || utils.noop;
          url = this.replace ? this.replace(this.url, encodedQuery) : this.url.replace(this.wildcard, encodedQuery);
          if (resp = requestCache.get(url)) {
            utils.defer(function () {
              cb(that.filter ? that.filter(resp) : resp);
            });
          } else {
            this._get(url, cb);
          }
          return !!resp;
        }
      });
      return Transport;
      function incrementPendingRequests() {
        pendingRequestsCount++;
      }
      function decrementPendingRequests() {
        pendingRequestsCount--;
      }
      function belowPendingRequestsThreshold() {
        return pendingRequestsCount < maxPendingRequests;
      }
    }();
  var Dataset = function () {
      var keys = {
          thumbprint: 'thumbprint',
          protocol: 'protocol',
          itemHash: 'itemHash',
          adjacencyList: 'adjacencyList'
        };
      function Dataset(o) {
        utils.bindAll(this);
        if (utils.isString(o.template) && !o.engine) {
          $.error('no template engine specified');
        }
        if (!o.local && !o.prefetch && !o.remote) {
          $.error('one of local, prefetch, or remote is required');
        }
        this.name = o.name || utils.getUniqueId();
        this.limit = o.limit || 5;
        this.minLength = o.minLength || 1;
        this.header = o.header;
        this.footer = o.footer;
        this.valueKey = o.valueKey || 'value';
        this.template = compileTemplate(o.template, o.engine, this.valueKey);
        this.local = o.local;
        this.prefetch = o.prefetch;
        this.remote = o.remote;
        this.itemHash = {};
        this.adjacencyList = {};
        this.storage = o.name ? new PersistentStorage(o.name) : null;
      }
      utils.mixin(Dataset.prototype, {
        _processLocalData: function (data) {
          this._mergeProcessedData(this._processData(data));
        },
        _loadPrefetchData: function (o) {
          var that = this, thumbprint = VERSION + (o.thumbprint || ''), storedThumbprint, storedProtocol, storedItemHash, storedAdjacencyList, isExpired, deferred;
          if (this.storage) {
            storedThumbprint = this.storage.get(keys.thumbprint);
            storedProtocol = this.storage.get(keys.protocol);
            storedItemHash = this.storage.get(keys.itemHash);
            storedAdjacencyList = this.storage.get(keys.adjacencyList);
          }
          isExpired = storedThumbprint !== thumbprint || storedProtocol !== utils.getProtocol();
          o = utils.isString(o) ? { url: o } : o;
          o.ttl = utils.isNumber(o.ttl) ? o.ttl : 24 * 60 * 60 * 1000;
          if (storedItemHash && storedAdjacencyList && !isExpired) {
            this._mergeProcessedData({
              itemHash: storedItemHash,
              adjacencyList: storedAdjacencyList
            });
            deferred = $.Deferred().resolve();
          } else {
            deferred = $.getJSON(o.url).done(processPrefetchData);
          }
          return deferred;
          function processPrefetchData(data) {
            var filteredData = o.filter ? o.filter(data) : data, processedData = that._processData(filteredData), itemHash = processedData.itemHash, adjacencyList = processedData.adjacencyList;
            if (that.storage) {
              that.storage.set(keys.itemHash, itemHash, o.ttl);
              that.storage.set(keys.adjacencyList, adjacencyList, o.ttl);
              that.storage.set(keys.thumbprint, thumbprint, o.ttl);
              that.storage.set(keys.protocol, utils.getProtocol(), o.ttl);
            }
            that._mergeProcessedData(processedData);
          }
        },
        _transformDatum: function (datum) {
          var value = utils.isString(datum) ? datum : datum[this.valueKey], tokens = datum.tokens || utils.tokenizeText(value), item = {
              value: value,
              tokens: tokens
            };
          if (utils.isString(datum)) {
            item.datum = {};
            item.datum[this.valueKey] = datum;
          } else {
            item.datum = datum;
          }
          item.tokens = utils.filter(item.tokens, function (token) {
            return !utils.isBlankString(token);
          });
          item.tokens = utils.map(item.tokens, function (token) {
            return token.toLowerCase();
          });
          return item;
        },
        _processData: function (data) {
          var that = this, itemHash = {}, adjacencyList = {};
          utils.each(data, function (i, datum) {
            var item = that._transformDatum(datum), id = utils.getUniqueId(item.value);
            itemHash[id] = item;
            utils.each(item.tokens, function (i, token) {
              var character = token.charAt(0), adjacency = adjacencyList[character] || (adjacencyList[character] = [id]);
              !~utils.indexOf(adjacency, id) && adjacency.push(id);
            });
          });
          return {
            itemHash: itemHash,
            adjacencyList: adjacencyList
          };
        },
        _mergeProcessedData: function (processedData) {
          var that = this;
          utils.mixin(this.itemHash, processedData.itemHash);
          utils.each(processedData.adjacencyList, function (character, adjacency) {
            var masterAdjacency = that.adjacencyList[character];
            that.adjacencyList[character] = masterAdjacency ? masterAdjacency.concat(adjacency) : adjacency;
          });
        },
        _getLocalSuggestions: function (terms) {
          var that = this, firstChars = [], lists = [], shortestList, suggestions = [];
          utils.each(terms, function (i, term) {
            var firstChar = term.charAt(0);
            !~utils.indexOf(firstChars, firstChar) && firstChars.push(firstChar);
          });
          utils.each(firstChars, function (i, firstChar) {
            var list = that.adjacencyList[firstChar];
            if (!list) {
              return false;
            }
            lists.push(list);
            if (!shortestList || list.length < shortestList.length) {
              shortestList = list;
            }
          });
          if (lists.length < firstChars.length) {
            return [];
          }
          utils.each(shortestList, function (i, id) {
            var item = that.itemHash[id], isCandidate, isMatch;
            isCandidate = utils.every(lists, function (list) {
              return ~utils.indexOf(list, id);
            });
            isMatch = isCandidate && utils.every(terms, function (term) {
              return utils.some(item.tokens, function (token) {
                return token.indexOf(term) === 0;
              });
            });
            isMatch && suggestions.push(item);
          });
          return suggestions;
        },
        initialize: function () {
          var deferred;
          this.local && this._processLocalData(this.local);
          this.transport = this.remote ? new Transport(this.remote) : null;
          deferred = this.prefetch ? this._loadPrefetchData(this.prefetch) : $.Deferred().resolve();
          this.local = this.prefetch = this.remote = null;
          this.initialize = function () {
            return deferred;
          };
          return deferred;
        },
        getSuggestions: function (query, cb) {
          var that = this, terms, suggestions, cacheHit = false;
          if (query.length < this.minLength) {
            return;
          }
          terms = utils.tokenizeQuery(query);
          suggestions = this._getLocalSuggestions(terms).slice(0, this.limit);
          if (suggestions.length < this.limit && this.transport) {
            cacheHit = this.transport.get(query, processRemoteData);
          }
          !cacheHit && cb && cb(suggestions);
          function processRemoteData(data) {
            suggestions = suggestions.slice(0);
            utils.each(data, function (i, datum) {
              var item = that._transformDatum(datum), isDuplicate;
              isDuplicate = utils.some(suggestions, function (suggestion) {
                return item.value === suggestion.value;
              });
              !isDuplicate && suggestions.push(item);
              return suggestions.length < that.limit;
            });
            cb && cb(suggestions);
          }
        }
      });
      return Dataset;
      function compileTemplate(template, engine, valueKey) {
        var renderFn, compiledTemplate;
        if (utils.isFunction(template)) {
          renderFn = template;
        } else if (utils.isString(template)) {
          compiledTemplate = engine.compile(template);
          renderFn = utils.bind(compiledTemplate.render, compiledTemplate);
        } else {
          renderFn = function (context) {
            return '<p>' + context[valueKey] + '</p>';
          };
        }
        return renderFn;
      }
    }();
  var InputView = function () {
      function InputView(o) {
        var that = this;
        utils.bindAll(this);
        this.specialKeyCodeMap = {
          9: 'tab',
          27: 'esc',
          37: 'left',
          39: 'right',
          13: 'enter',
          38: 'up',
          40: 'down'
        };
        this.$hint = $(o.hint);
        this.$input = $(o.input).on('blur.tt', this._handleBlur).on('focus.tt', this._handleFocus).on('keydown.tt', this._handleSpecialKeyEvent);
        if (!utils.isMsie()) {
          this.$input.on('input.tt', this._compareQueryToInputValue);
        } else {
          this.$input.on('keydown.tt keypress.tt cut.tt paste.tt', function ($e) {
            if (that.specialKeyCodeMap[$e.which || $e.keyCode]) {
              return;
            }
            utils.defer(that._compareQueryToInputValue);
          });
        }
        this.query = this.$input.val();
        this.$overflowHelper = buildOverflowHelper(this.$input);
      }
      utils.mixin(InputView.prototype, EventTarget, {
        _handleFocus: function () {
          this.trigger('focused');
        },
        _handleBlur: function () {
          this.trigger('blured');
        },
        _handleSpecialKeyEvent: function ($e) {
          var keyName = this.specialKeyCodeMap[$e.which || $e.keyCode];
          keyName && this.trigger(keyName + 'Keyed', $e);
        },
        _compareQueryToInputValue: function () {
          var inputValue = this.getInputValue(), isSameQuery = compareQueries(this.query, inputValue), isSameQueryExceptWhitespace = isSameQuery ? this.query.length !== inputValue.length : false;
          if (isSameQueryExceptWhitespace) {
            this.trigger('whitespaceChanged', { value: this.query });
          } else if (!isSameQuery) {
            this.trigger('queryChanged', { value: this.query = inputValue });
          }
        },
        destroy: function () {
          this.$hint.off('.tt');
          this.$input.off('.tt');
          this.$hint = this.$input = this.$overflowHelper = null;
        },
        focus: function () {
          this.$input.focus();
        },
        blur: function () {
          this.$input.blur();
        },
        getQuery: function () {
          return this.query;
        },
        setQuery: function (query) {
          this.query = query;
        },
        getInputValue: function () {
          return this.$input.val();
        },
        setInputValue: function (value, silent) {
          this.$input.val(value);
          !silent && this._compareQueryToInputValue();
        },
        getHintValue: function () {
          return this.$hint.val();
        },
        setHintValue: function (value) {
          this.$hint.val(value);
        },
        getLanguageDirection: function () {
          return (this.$input.css('direction') || 'ltr').toLowerCase();
        },
        isOverflow: function () {
          this.$overflowHelper.text(this.getInputValue());
          return this.$overflowHelper.width() > this.$input.width();
        },
        isCursorAtEnd: function () {
          var valueLength = this.$input.val().length, selectionStart = this.$input[0].selectionStart, range;
          if (utils.isNumber(selectionStart)) {
            return selectionStart === valueLength;
          } else if (document.selection) {
            range = document.selection.createRange();
            range.moveStart('character', -valueLength);
            return valueLength === range.text.length;
          }
          return true;
        }
      });
      return InputView;
      function buildOverflowHelper($input) {
        return $('<span></span>').css({
          position: 'absolute',
          left: '-9999px',
          visibility: 'hidden',
          whiteSpace: 'nowrap',
          fontFamily: $input.css('font-family'),
          fontSize: $input.css('font-size'),
          fontStyle: $input.css('font-style'),
          fontVariant: $input.css('font-variant'),
          fontWeight: $input.css('font-weight'),
          wordSpacing: $input.css('word-spacing'),
          letterSpacing: $input.css('letter-spacing'),
          textIndent: $input.css('text-indent'),
          textRendering: $input.css('text-rendering'),
          textTransform: $input.css('text-transform')
        }).insertAfter($input);
      }
      function compareQueries(a, b) {
        a = (a || '').replace(/^\s*/g, '').replace(/\s{2,}/g, ' ');
        b = (b || '').replace(/^\s*/g, '').replace(/\s{2,}/g, ' ');
        return a === b;
      }
    }();
  var DropdownView = function () {
      var html = { suggestionsList: '<span class="tt-suggestions"></span>' }, css = {
          suggestionsList: { display: 'block' },
          suggestion: {
            whiteSpace: 'nowrap',
            cursor: 'pointer'
          },
          suggestionChild: { whiteSpace: 'normal' }
        };
      function DropdownView(o) {
        utils.bindAll(this);
        this.isOpen = false;
        this.isEmpty = true;
        this.isMouseOverDropdown = false;
        this.$menu = $(o.menu).on('mouseenter.tt', this._handleMouseenter).on('mouseleave.tt', this._handleMouseleave).on('click.tt', '.tt-suggestion', this._handleSelection).on('mouseover.tt', '.tt-suggestion', this._handleMouseover);
      }
      utils.mixin(DropdownView.prototype, EventTarget, {
        _handleMouseenter: function () {
          this.isMouseOverDropdown = true;
        },
        _handleMouseleave: function () {
          this.isMouseOverDropdown = false;
        },
        _handleMouseover: function ($e) {
          var $suggestion = $($e.currentTarget);
          this._getSuggestions().removeClass('tt-is-under-cursor');
          $suggestion.addClass('tt-is-under-cursor');
        },
        _handleSelection: function ($e) {
          var $suggestion = $($e.currentTarget);
          this.trigger('suggestionSelected', extractSuggestion($suggestion));
        },
        _show: function () {
          this.$menu.css('display', 'block');
        },
        _hide: function () {
          this.$menu.hide();
        },
        _moveCursor: function (increment) {
          var $suggestions, $cur, nextIndex, $underCursor;
          if (!this.isVisible()) {
            return;
          }
          $suggestions = this._getSuggestions();
          $cur = $suggestions.filter('.tt-is-under-cursor');
          $cur.removeClass('tt-is-under-cursor');
          nextIndex = $suggestions.index($cur) + increment;
          nextIndex = (nextIndex + 1) % ($suggestions.length + 1) - 1;
          if (nextIndex === -1) {
            this.trigger('cursorRemoved');
            return;
          } else if (nextIndex < -1) {
            nextIndex = $suggestions.length - 1;
          }
          $underCursor = $suggestions.eq(nextIndex).addClass('tt-is-under-cursor');
          this._ensureVisibility($underCursor);
          this.trigger('cursorMoved', extractSuggestion($underCursor));
        },
        _getSuggestions: function () {
          return this.$menu.find('.tt-suggestions > .tt-suggestion');
        },
        _ensureVisibility: function ($el) {
          var menuHeight = this.$menu.height() + parseInt(this.$menu.css('paddingTop'), 10) + parseInt(this.$menu.css('paddingBottom'), 10), menuScrollTop = this.$menu.scrollTop(), elTop = $el.position().top, elBottom = elTop + $el.outerHeight(true);
          if (elTop < 0) {
            this.$menu.scrollTop(menuScrollTop + elTop);
          } else if (menuHeight < elBottom) {
            this.$menu.scrollTop(menuScrollTop + (elBottom - menuHeight));
          }
        },
        destroy: function () {
          this.$menu.off('.tt');
          this.$menu = null;
        },
        isVisible: function () {
          return this.isOpen && !this.isEmpty;
        },
        closeUnlessMouseIsOverDropdown: function () {
          if (!this.isMouseOverDropdown) {
            this.close();
          }
        },
        close: function () {
          if (this.isOpen) {
            this.isOpen = false;
            this.isMouseOverDropdown = false;
            this._hide();
            this.$menu.find('.tt-suggestions > .tt-suggestion').removeClass('tt-is-under-cursor');
            this.trigger('closed');
          }
        },
        open: function () {
          if (!this.isOpen) {
            this.isOpen = true;
            !this.isEmpty && this._show();
            this.trigger('opened');
          }
        },
        setLanguageDirection: function (dir) {
          var ltrCss = {
              left: '0',
              right: 'auto'
            }, rtlCss = {
              left: 'auto',
              right: ' 0'
            };
          dir === 'ltr' ? this.$menu.css(ltrCss) : this.$menu.css(rtlCss);
        },
        moveCursorUp: function () {
          this._moveCursor(-1);
        },
        moveCursorDown: function () {
          this._moveCursor(+1);
        },
        getSuggestionUnderCursor: function () {
          var $suggestion = this._getSuggestions().filter('.tt-is-under-cursor').first();
          return $suggestion.length > 0 ? extractSuggestion($suggestion) : null;
        },
        getFirstSuggestion: function () {
          var $suggestion = this._getSuggestions().first();
          return $suggestion.length > 0 ? extractSuggestion($suggestion) : null;
        },
        renderSuggestions: function (dataset, suggestions) {
          var datasetClassName = 'tt-dataset-' + dataset.name, wrapper = '<div class="tt-suggestion">%body</div>', compiledHtml, $suggestionsList, $dataset = this.$menu.find('.' + datasetClassName), elBuilder, fragment, $el;
          if ($dataset.length === 0) {
            $suggestionsList = $(html.suggestionsList).css(css.suggestionsList);
            $dataset = $('<div></div>').addClass(datasetClassName).append(dataset.header).append($suggestionsList).append(dataset.footer).appendTo(this.$menu);
          }
          if (suggestions.length > 0) {
            this.isEmpty = false;
            this.isOpen && this._show();
            elBuilder = document.createElement('div');
            fragment = document.createDocumentFragment();
            utils.each(suggestions, function (i, suggestion) {
              suggestion.dataset = dataset.name;
              compiledHtml = dataset.template(suggestion.datum);
              elBuilder.innerHTML = wrapper.replace('%body', compiledHtml);
              $el = $(elBuilder.firstChild).css(css.suggestion).data('suggestion', suggestion);
              $el.children().each(function () {
                $(this).css(css.suggestionChild);
              });
              fragment.appendChild($el[0]);
            });
            $dataset.show().find('.tt-suggestions').html(fragment);
          } else {
            this.clearSuggestions(dataset.name);
          }
          this.trigger('suggestionsRendered');
        },
        clearSuggestions: function (datasetName) {
          var $datasets = datasetName ? this.$menu.find('.tt-dataset-' + datasetName) : this.$menu.find('[class^="tt-dataset-"]'), $suggestions = $datasets.find('.tt-suggestions');
          $datasets.hide();
          $suggestions.empty();
          if (this._getSuggestions().length === 0) {
            this.isEmpty = true;
            this._hide();
          }
        }
      });
      return DropdownView;
      function extractSuggestion($el) {
        return $el.data('suggestion');
      }
    }();
  var TypeaheadView = function () {
      var html = {
          wrapper: '<span class="twitter-typeahead"></span>',
          hint: '<input class="tt-hint" type="text" autocomplete="off" spellcheck="off" disabled>',
          dropdown: '<span class="tt-dropdown-menu"></span>'
        }, css = {
          wrapper: {
            position: 'relative',
            display: 'inline-block'
          },
          hint: {
            position: 'absolute',
            top: '0',
            left: '0',
            borderColor: 'transparent',
            boxShadow: 'none'
          },
          query: {
            position: 'relative',
            verticalAlign: 'top',
            backgroundColor: 'transparent'
          },
          dropdown: {
            position: 'absolute',
            top: '100%',
            left: '0',
            zIndex: '100',
            display: 'none'
          }
        };
      if (utils.isMsie()) {
        utils.mixin(css.query, { backgroundImage: 'url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)' });
      }
      if (utils.isMsie() && utils.isMsie() <= 7) {
        utils.mixin(css.wrapper, {
          display: 'inline',
          zoom: '1'
        });
        utils.mixin(css.query, { marginTop: '-1px' });
      }
      function TypeaheadView(o) {
        var $menu, $input, $hint;
        utils.bindAll(this);
        this.$node = buildDomStructure(o.input);
        this.datasets = o.datasets;
        this.dir = null;
        this.eventBus = o.eventBus;
        $menu = this.$node.find('.tt-dropdown-menu');
        $input = this.$node.find('.tt-query');
        $hint = this.$node.find('.tt-hint');
        this.dropdownView = new DropdownView({ menu: $menu }).on('suggestionSelected', this._handleSelection).on('cursorMoved', this._clearHint).on('cursorMoved', this._setInputValueToSuggestionUnderCursor).on('cursorRemoved', this._setInputValueToQuery).on('cursorRemoved', this._updateHint).on('suggestionsRendered', this._updateHint).on('opened', this._updateHint).on('closed', this._clearHint).on('opened closed', this._propagateEvent);
        this.inputView = new InputView({
          input: $input,
          hint: $hint
        }).on('focused', this._openDropdown).on('blured', this._closeDropdown).on('blured', this._setInputValueToQuery).on('enterKeyed tabKeyed', this._handleSelection).on('queryChanged', this._clearHint).on('queryChanged', this._clearSuggestions).on('queryChanged', this._getSuggestions).on('whitespaceChanged', this._updateHint).on('queryChanged whitespaceChanged', this._openDropdown).on('queryChanged whitespaceChanged', this._setLanguageDirection).on('escKeyed', this._closeDropdown).on('escKeyed', this._setInputValueToQuery).on('tabKeyed upKeyed downKeyed', this._managePreventDefault).on('upKeyed downKeyed', this._moveDropdownCursor).on('upKeyed downKeyed', this._openDropdown).on('tabKeyed leftKeyed rightKeyed', this._autocomplete);
      }
      utils.mixin(TypeaheadView.prototype, EventTarget, {
        _managePreventDefault: function (e) {
          var $e = e.data, hint, inputValue, preventDefault = false;
          switch (e.type) {
          case 'tabKeyed':
            hint = this.inputView.getHintValue();
            inputValue = this.inputView.getInputValue();
            preventDefault = hint && hint !== inputValue;
            break;
          case 'upKeyed':
          case 'downKeyed':
            preventDefault = !$e.shiftKey && !$e.ctrlKey && !$e.metaKey;
            break;
          }
          preventDefault && $e.preventDefault();
        },
        _setLanguageDirection: function () {
          var dir = this.inputView.getLanguageDirection();
          if (dir !== this.dir) {
            this.dir = dir;
            this.$node.css('direction', dir);
            this.dropdownView.setLanguageDirection(dir);
          }
        },
        _updateHint: function () {
          var suggestion = this.dropdownView.getFirstSuggestion(), hint = suggestion ? suggestion.value : null, dropdownIsVisible = this.dropdownView.isVisible(), inputHasOverflow = this.inputView.isOverflow(), inputValue, query, escapedQuery, beginsWithQuery, match;
          if (hint && dropdownIsVisible && !inputHasOverflow) {
            inputValue = this.inputView.getInputValue();
            query = inputValue.replace(/\s{2,}/g, ' ').replace(/^\s+/g, '');
            escapedQuery = utils.escapeRegExChars(query);
            beginsWithQuery = new RegExp('^(?:' + escapedQuery + ')(.*$)', 'i');
            match = beginsWithQuery.exec(hint);
            this.inputView.setHintValue(inputValue + (match ? match[1] : ''));
          }
        },
        _clearHint: function () {
          this.inputView.setHintValue('');
        },
        _clearSuggestions: function () {
          this.dropdownView.clearSuggestions();
        },
        _setInputValueToQuery: function () {
          this.inputView.setInputValue(this.inputView.getQuery());
        },
        _setInputValueToSuggestionUnderCursor: function (e) {
          var suggestion = e.data;
          this.inputView.setInputValue(suggestion.value, true);
        },
        _openDropdown: function () {
          this.dropdownView.open();
        },
        _closeDropdown: function (e) {
          this.dropdownView[e.type === 'blured' ? 'closeUnlessMouseIsOverDropdown' : 'close']();
        },
        _moveDropdownCursor: function (e) {
          var $e = e.data;
          if (!$e.shiftKey && !$e.ctrlKey && !$e.metaKey) {
            this.dropdownView[e.type === 'upKeyed' ? 'moveCursorUp' : 'moveCursorDown']();
          }
        },
        _handleSelection: function (e) {
          var byClick = e.type === 'suggestionSelected', suggestion = byClick ? e.data : this.dropdownView.getSuggestionUnderCursor();
          if (suggestion) {
            this.inputView.setInputValue(suggestion.value);
            byClick ? this.inputView.focus() : e.data.preventDefault();
            byClick && utils.isMsie() ? utils.defer(this.dropdownView.close) : this.dropdownView.close();
            this.eventBus.trigger('selected', suggestion.datum, suggestion.dataset);
          }
        },
        _getSuggestions: function () {
          var that = this, query = this.inputView.getQuery();
          if (utils.isBlankString(query)) {
            return;
          }
          utils.each(this.datasets, function (i, dataset) {
            dataset.getSuggestions(query, function (suggestions) {
              if (query === that.inputView.getQuery()) {
                that.dropdownView.renderSuggestions(dataset, suggestions);
              }
            });
          });
        },
        _autocomplete: function (e) {
          var isCursorAtEnd, ignoreEvent, query, hint, suggestion;
          if (e.type === 'rightKeyed' || e.type === 'leftKeyed') {
            isCursorAtEnd = this.inputView.isCursorAtEnd();
            ignoreEvent = this.inputView.getLanguageDirection() === 'ltr' ? e.type === 'leftKeyed' : e.type === 'rightKeyed';
            if (!isCursorAtEnd || ignoreEvent) {
              return;
            }
          }
          query = this.inputView.getQuery();
          hint = this.inputView.getHintValue();
          if (hint !== '' && query !== hint) {
            suggestion = this.dropdownView.getFirstSuggestion();
            this.inputView.setInputValue(suggestion.value);
            this.eventBus.trigger('autocompleted', suggestion.datum, suggestion.dataset);
          }
        },
        _propagateEvent: function (e) {
          this.eventBus.trigger(e.type);
        },
        destroy: function () {
          this.inputView.destroy();
          this.dropdownView.destroy();
          destroyDomStructure(this.$node);
          this.$node = null;
        },
        setQuery: function (query) {
          this.inputView.setQuery(query);
          this.inputView.setInputValue(query);
          this._clearHint();
          this._clearSuggestions();
          this._getSuggestions();
        }
      });
      return TypeaheadView;
      function buildDomStructure(input) {
        var $wrapper = $(html.wrapper), $dropdown = $(html.dropdown), $input = $(input), $hint = $(html.hint);
        $wrapper = $wrapper.css(css.wrapper);
        $dropdown = $dropdown.css(css.dropdown);
        $hint.css(css.hint).css({
          backgroundAttachment: $input.css('background-attachment'),
          backgroundClip: $input.css('background-clip'),
          backgroundColor: $input.css('background-color'),
          backgroundImage: $input.css('background-image'),
          backgroundOrigin: $input.css('background-origin'),
          backgroundPosition: $input.css('background-position'),
          backgroundRepeat: $input.css('background-repeat'),
          backgroundSize: $input.css('background-size')
        });
        $input.data('ttAttrs', {
          dir: $input.attr('dir'),
          autocomplete: $input.attr('autocomplete'),
          spellcheck: $input.attr('spellcheck'),
          style: $input.attr('style')
        });
        $input.addClass('tt-query').attr({
          autocomplete: 'off',
          spellcheck: false
        }).css(css.query);
        try {
          !$input.attr('dir') && $input.attr('dir', 'auto');
        } catch (e) {
        }
        return $input.wrap($wrapper).parent().prepend($hint).append($dropdown);
      }
      function destroyDomStructure($node) {
        var $input = $node.find('.tt-query');
        utils.each($input.data('ttAttrs'), function (key, val) {
          utils.isUndefined(val) ? $input.removeAttr(key) : $input.attr(key, val);
        });
        $input.detach().removeData('ttAttrs').removeClass('tt-query').insertAfter($node);
        $node.remove();
      }
    }();
  (function () {
    var cache = {}, viewKey = 'ttView', methods;
    methods = {
      initialize: function (datasetDefs) {
        var datasets;
        datasetDefs = utils.isArray(datasetDefs) ? datasetDefs : [datasetDefs];
        if (datasetDefs.length === 0) {
          $.error('no datasets provided');
        }
        datasets = utils.map(datasetDefs, function (o) {
          var dataset = cache[o.name] ? cache[o.name] : new Dataset(o);
          if (o.name) {
            cache[o.name] = dataset;
          }
          return dataset;
        });
        return this.each(initialize);
        function initialize() {
          var $input = $(this), deferreds, eventBus = new EventBus({ el: $input });
          deferreds = utils.map(datasets, function (dataset) {
            return dataset.initialize();
          });
          $input.data(viewKey, new TypeaheadView({
            input: $input,
            eventBus: eventBus = new EventBus({ el: $input }),
            datasets: datasets
          }));
          $.when.apply($, deferreds).always(function () {
            utils.defer(function () {
              eventBus.trigger('initialized');
            });
          });
        }
      },
      destroy: function () {
        return this.each(destroy);
        function destroy() {
          var $this = $(this), view = $this.data(viewKey);
          if (view) {
            view.destroy();
            $this.removeData(viewKey);
          }
        }
      },
      setQuery: function (query) {
        return this.each(setQuery);
        function setQuery() {
          var view = $(this).data(viewKey);
          view && view.setQuery(query);
        }
      }
    };
    jQuery.fn.typeahead = function (method) {
      if (methods[method]) {
        return methods[method].apply(this, [].slice.call(arguments, 1));
      } else {
        return methods.initialize.apply(this, arguments);
      }
    };
  }());
}(window.jQuery));
(function () {
  var root = this;
  var previousUnderscore = root._;
  var breaker = {};
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;
  var push = ArrayProto.push, slice = ArrayProto.slice, concat = ArrayProto.concat, toString = ObjProto.toString, hasOwnProperty = ObjProto.hasOwnProperty;
  var nativeForEach = ArrayProto.forEach, nativeMap = ArrayProto.map, nativeReduce = ArrayProto.reduce, nativeReduceRight = ArrayProto.reduceRight, nativeFilter = ArrayProto.filter, nativeEvery = ArrayProto.every, nativeSome = ArrayProto.some, nativeIndexOf = ArrayProto.indexOf, nativeLastIndexOf = ArrayProto.lastIndexOf, nativeIsArray = Array.isArray, nativeKeys = Object.keys, nativeBind = FuncProto.bind;
  var _ = function (obj) {
    if (obj instanceof _)
      return obj;
    if (!(this instanceof _))
      return new _(obj);
    this._wrapped = obj;
  };
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }
  _.VERSION = '1.5.1';
  var each = _.each = _.forEach = function (obj, iterator, context) {
      if (obj == null)
        return;
      if (nativeForEach && obj.forEach === nativeForEach) {
        obj.forEach(iterator, context);
      } else if (obj.length === +obj.length) {
        for (var i = 0, l = obj.length; i < l; i++) {
          if (iterator.call(context, obj[i], i, obj) === breaker)
            return;
        }
      } else {
        for (var key in obj) {
          if (_.has(obj, key)) {
            if (iterator.call(context, obj[key], key, obj) === breaker)
              return;
          }
        }
      }
    };
  _.map = _.collect = function (obj, iterator, context) {
    var results = [];
    if (obj == null)
      return results;
    if (nativeMap && obj.map === nativeMap)
      return obj.map(iterator, context);
    each(obj, function (value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };
  var reduceError = 'Reduce of empty array with no initial value';
  _.reduce = _.foldl = _.inject = function (obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null)
      obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context)
        iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function (value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial)
      throw new TypeError(reduceError);
    return memo;
  };
  _.reduceRight = _.foldr = function (obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null)
      obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context)
        iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function (value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial)
      throw new TypeError(reduceError);
    return memo;
  };
  _.find = _.detect = function (obj, iterator, context) {
    var result;
    any(obj, function (value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };
  _.filter = _.select = function (obj, iterator, context) {
    var results = [];
    if (obj == null)
      return results;
    if (nativeFilter && obj.filter === nativeFilter)
      return obj.filter(iterator, context);
    each(obj, function (value, index, list) {
      if (iterator.call(context, value, index, list))
        results.push(value);
    });
    return results;
  };
  _.reject = function (obj, iterator, context) {
    return _.filter(obj, function (value, index, list) {
      return !iterator.call(context, value, index, list);
    }, context);
  };
  _.every = _.all = function (obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = true;
    if (obj == null)
      return result;
    if (nativeEvery && obj.every === nativeEvery)
      return obj.every(iterator, context);
    each(obj, function (value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list)))
        return breaker;
    });
    return !!result;
  };
  var any = _.some = _.any = function (obj, iterator, context) {
      iterator || (iterator = _.identity);
      var result = false;
      if (obj == null)
        return result;
      if (nativeSome && obj.some === nativeSome)
        return obj.some(iterator, context);
      each(obj, function (value, index, list) {
        if (result || (result = iterator.call(context, value, index, list)))
          return breaker;
      });
      return !!result;
    };
  _.contains = _.include = function (obj, target) {
    if (obj == null)
      return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf)
      return obj.indexOf(target) != -1;
    return any(obj, function (value) {
      return value === target;
    });
  };
  _.invoke = function (obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function (value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };
  _.pluck = function (obj, key) {
    return _.map(obj, function (value) {
      return value[key];
    });
  };
  _.where = function (obj, attrs, first) {
    if (_.isEmpty(attrs))
      return first ? void 0 : [];
    return _[first ? 'find' : 'filter'](obj, function (value) {
      for (var key in attrs) {
        if (attrs[key] !== value[key])
          return false;
      }
      return true;
    });
  };
  _.findWhere = function (obj, attrs) {
    return _.where(obj, attrs, true);
  };
  _.max = function (obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj))
      return -Infinity;
    var result = {
        computed: -Infinity,
        value: -Infinity
      };
    each(obj, function (value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed > result.computed && (result = {
        value: value,
        computed: computed
      });
    });
    return result.value;
  };
  _.min = function (obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj))
      return Infinity;
    var result = {
        computed: Infinity,
        value: Infinity
      };
    each(obj, function (value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {
        value: value,
        computed: computed
      });
    });
    return result.value;
  };
  _.shuffle = function (obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function (value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };
  var lookupIterator = function (value) {
    return _.isFunction(value) ? value : function (obj) {
      return obj[value];
    };
  };
  _.sortBy = function (obj, value, context) {
    var iterator = lookupIterator(value);
    return _.pluck(_.map(obj, function (value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iterator.call(context, value, index, list)
      };
    }).sort(function (left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0)
          return 1;
        if (a < b || b === void 0)
          return -1;
      }
      return left.index < right.index ? -1 : 1;
    }), 'value');
  };
  var group = function (obj, value, context, behavior) {
    var result = {};
    var iterator = lookupIterator(value == null ? _.identity : value);
    each(obj, function (value, index) {
      var key = iterator.call(context, value, index, obj);
      behavior(result, key, value);
    });
    return result;
  };
  _.groupBy = function (obj, value, context) {
    return group(obj, value, context, function (result, key, value) {
      (_.has(result, key) ? result[key] : result[key] = []).push(value);
    });
  };
  _.countBy = function (obj, value, context) {
    return group(obj, value, context, function (result, key) {
      if (!_.has(result, key))
        result[key] = 0;
      result[key]++;
    });
  };
  _.sortedIndex = function (array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = low + high >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };
  _.toArray = function (obj) {
    if (!obj)
      return [];
    if (_.isArray(obj))
      return slice.call(obj);
    if (obj.length === +obj.length)
      return _.map(obj, _.identity);
    return _.values(obj);
  };
  _.size = function (obj) {
    if (obj == null)
      return 0;
    return obj.length === +obj.length ? obj.length : _.keys(obj).length;
  };
  _.first = _.head = _.take = function (array, n, guard) {
    if (array == null)
      return void 0;
    return n != null && !guard ? slice.call(array, 0, n) : array[0];
  };
  _.initial = function (array, n, guard) {
    return slice.call(array, 0, array.length - (n == null || guard ? 1 : n));
  };
  _.last = function (array, n, guard) {
    if (array == null)
      return void 0;
    if (n != null && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };
  _.rest = _.tail = _.drop = function (array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };
  _.compact = function (array) {
    return _.filter(array, _.identity);
  };
  var flatten = function (input, shallow, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    each(input, function (value) {
      if (_.isArray(value) || _.isArguments(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };
  _.flatten = function (array, shallow) {
    return flatten(array, shallow, []);
  };
  _.without = function (array) {
    return _.difference(array, slice.call(arguments, 1));
  };
  _.uniq = _.unique = function (array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function (value, index) {
      if (isSorted ? !index || seen[seen.length - 1] !== value : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };
  _.union = function () {
    return _.uniq(_.flatten(arguments, true));
  };
  _.intersection = function (array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function (item) {
      return _.every(rest, function (other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };
  _.difference = function (array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function (value) {
      return !_.contains(rest, value);
    });
  };
  _.zip = function () {
    var length = _.max(_.pluck(arguments, 'length').concat(0));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, '' + i);
    }
    return results;
  };
  _.object = function (list, values) {
    if (list == null)
      return {};
    var result = {};
    for (var i = 0, l = list.length; i < l; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };
  _.indexOf = function (array, item, isSorted) {
    if (array == null)
      return -1;
    var i = 0, l = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = isSorted < 0 ? Math.max(0, l + isSorted) : isSorted;
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf)
      return array.indexOf(item, isSorted);
    for (; i < l; i++)
      if (array[i] === item)
        return i;
    return -1;
  };
  _.lastIndexOf = function (array, item, from) {
    if (array == null)
      return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = hasIndex ? from : array.length;
    while (i--)
      if (array[i] === item)
        return i;
    return -1;
  };
  _.range = function (start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;
    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);
    while (idx < len) {
      range[idx++] = start;
      start += step;
    }
    return range;
  };
  var ctor = function () {
  };
  _.bind = function (func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind)
      return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func))
      throw new TypeError();
    args = slice.call(arguments, 2);
    return bound = function () {
      if (!(this instanceof bound))
        return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor();
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result)
        return result;
      return self;
    };
  };
  _.partial = function (func) {
    var args = slice.call(arguments, 1);
    return function () {
      return func.apply(this, args.concat(slice.call(arguments)));
    };
  };
  _.bindAll = function (obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0)
      throw new Error('bindAll must be passed function names');
    each(funcs, function (f) {
      obj[f] = _.bind(obj[f], obj);
    });
    return obj;
  };
  _.memoize = function (func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function () {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : memo[key] = func.apply(this, arguments);
    };
  };
  _.delay = function (func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function () {
      return func.apply(null, args);
    }, wait);
  };
  _.defer = function (func) {
    return _.delay.apply(_, [
      func,
      1
    ].concat(slice.call(arguments, 1)));
  };
  _.throttle = function (func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function () {
      previous = options.leading === false ? 0 : new Date();
      timeout = null;
      result = func.apply(context, args);
    };
    return function () {
      var now = new Date();
      if (!previous && options.leading === false)
        previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };
  _.debounce = function (func, wait, immediate) {
    var result;
    var timeout = null;
    return function () {
      var context = this, args = arguments;
      var later = function () {
        timeout = null;
        if (!immediate)
          result = func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow)
        result = func.apply(context, args);
      return result;
    };
  };
  _.once = function (func) {
    var ran = false, memo;
    return function () {
      if (ran)
        return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };
  _.wrap = function (func, wrapper) {
    return function () {
      var args = [func];
      push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  };
  _.compose = function () {
    var funcs = arguments;
    return function () {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };
  _.after = function (times, func) {
    return function () {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };
  _.keys = nativeKeys || function (obj) {
    if (obj !== Object(obj))
      throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj)
      if (_.has(obj, key))
        keys.push(key);
    return keys;
  };
  _.values = function (obj) {
    var values = [];
    for (var key in obj)
      if (_.has(obj, key))
        values.push(obj[key]);
    return values;
  };
  _.pairs = function (obj) {
    var pairs = [];
    for (var key in obj)
      if (_.has(obj, key))
        pairs.push([
          key,
          obj[key]
        ]);
    return pairs;
  };
  _.invert = function (obj) {
    var result = {};
    for (var key in obj)
      if (_.has(obj, key))
        result[obj[key]] = key;
    return result;
  };
  _.functions = _.methods = function (obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key]))
        names.push(key);
    }
    return names.sort();
  };
  _.extend = function (obj) {
    each(slice.call(arguments, 1), function (source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };
  _.pick = function (obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function (key) {
      if (key in obj)
        copy[key] = obj[key];
    });
    return copy;
  };
  _.omit = function (obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key))
        copy[key] = obj[key];
    }
    return copy;
  };
  _.defaults = function (obj) {
    each(slice.call(arguments, 1), function (source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === void 0)
            obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };
  _.clone = function (obj) {
    if (!_.isObject(obj))
      return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };
  _.tap = function (obj, interceptor) {
    interceptor(obj);
    return obj;
  };
  var eq = function (a, b, aStack, bStack) {
    if (a === b)
      return a !== 0 || 1 / a == 1 / b;
    if (a == null || b == null)
      return a === b;
    if (a instanceof _)
      a = a._wrapped;
    if (b instanceof _)
      b = b._wrapped;
    var className = toString.call(a);
    if (className != toString.call(b))
      return false;
    switch (className) {
    case '[object String]':
      return a == String(b);
    case '[object Number]':
      return a != +a ? b != +b : a == 0 ? 1 / a == 1 / b : a == +b;
    case '[object Date]':
    case '[object Boolean]':
      return +a == +b;
    case '[object RegExp]':
      return a.source == b.source && a.global == b.global && a.multiline == b.multiline && a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object')
      return false;
    var length = aStack.length;
    while (length--) {
      if (aStack[length] == a)
        return bStack[length] == b;
    }
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor && _.isFunction(bCtor) && bCtor instanceof bCtor)) {
      return false;
    }
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    if (className == '[object Array]') {
      size = a.length;
      result = size == b.length;
      if (result) {
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack)))
            break;
        }
      }
    } else {
      for (var key in a) {
        if (_.has(a, key)) {
          size++;
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack)))
            break;
        }
      }
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !size--)
            break;
        }
        result = !size;
      }
    }
    aStack.pop();
    bStack.pop();
    return result;
  };
  _.isEqual = function (a, b) {
    return eq(a, b, [], []);
  };
  _.isEmpty = function (obj) {
    if (obj == null)
      return true;
    if (_.isArray(obj) || _.isString(obj))
      return obj.length === 0;
    for (var key in obj)
      if (_.has(obj, key))
        return false;
    return true;
  };
  _.isElement = function (obj) {
    return !!(obj && obj.nodeType === 1);
  };
  _.isArray = nativeIsArray || function (obj) {
    return toString.call(obj) == '[object Array]';
  };
  _.isObject = function (obj) {
    return obj === Object(obj);
  };
  each([
    'Arguments',
    'Function',
    'String',
    'Number',
    'Date',
    'RegExp'
  ], function (name) {
    _['is' + name] = function (obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });
  if (!_.isArguments(arguments)) {
    _.isArguments = function (obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }
  if (typeof /./ !== 'function') {
    _.isFunction = function (obj) {
      return typeof obj === 'function';
    };
  }
  _.isFinite = function (obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };
  _.isNaN = function (obj) {
    return _.isNumber(obj) && obj != +obj;
  };
  _.isBoolean = function (obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };
  _.isNull = function (obj) {
    return obj === null;
  };
  _.isUndefined = function (obj) {
    return obj === void 0;
  };
  _.has = function (obj, key) {
    return hasOwnProperty.call(obj, key);
  };
  _.noConflict = function () {
    root._ = previousUnderscore;
    return this;
  };
  _.identity = function (value) {
    return value;
  };
  _.times = function (n, iterator, context) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++)
      accum[i] = iterator.call(context, i);
    return accum;
  };
  _.random = function (min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };
  var entityMap = {
      escape: {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        '\'': '&#x27;',
        '/': '&#x2F;'
      }
    };
  entityMap.unescape = _.invert(entityMap.escape);
  var entityRegexes = {
      escape: new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
      unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
    };
  _.each([
    'escape',
    'unescape'
  ], function (method) {
    _[method] = function (string) {
      if (string == null)
        return '';
      return ('' + string).replace(entityRegexes[method], function (match) {
        return entityMap[method][match];
      });
    };
  });
  _.result = function (object, property) {
    if (object == null)
      return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };
  _.mixin = function (obj) {
    each(_.functions(obj), function (name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function () {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };
  var idCounter = 0;
  _.uniqueId = function (prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };
  _.templateSettings = {
    evaluate: /<%([\s\S]+?)%>/g,
    interpolate: /<%=([\s\S]+?)%>/g,
    escape: /<%-([\s\S]+?)%>/g
  };
  var noMatch = /(.)^/;
  var escapes = {
      '\'': '\'',
      '\\': '\\',
      '\r': 'r',
      '\n': 'n',
      '\t': 't',
      '\u2028': 'u2028',
      '\u2029': 'u2029'
    };
  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
  _.template = function (text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);
    var matcher = new RegExp([
        (settings.escape || noMatch).source,
        (settings.interpolate || noMatch).source,
        (settings.evaluate || noMatch).source
      ].join('|') + '|$', 'g');
    var index = 0;
    var source = '__p+=\'';
    text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, function (match) {
        return '\\' + escapes[match];
      });
      if (escape) {
        source += '\'+\n((__t=(' + escape + '))==null?\'\':_.escape(__t))+\n\'';
      }
      if (interpolate) {
        source += '\'+\n((__t=(' + interpolate + '))==null?\'\':__t)+\n\'';
      }
      if (evaluate) {
        source += '\';\n' + evaluate + '\n__p+=\'';
      }
      index = offset + match.length;
      return match;
    });
    source += '\';\n';
    if (!settings.variable)
      source = 'with(obj||{}){\n' + source + '}\n';
    source = 'var __t,__p=\'\',__j=Array.prototype.join,' + 'print=function(){__p+=__j.call(arguments,\'\');};\n' + source + 'return __p;\n';
    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }
    if (data)
      return render(data, _);
    var template = function (data) {
      return render.call(this, data, _);
    };
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';
    return template;
  };
  _.chain = function (obj) {
    return _(obj).chain();
  };
  var result = function (obj) {
    return this._chain ? _(obj).chain() : obj;
  };
  _.mixin(_);
  each([
    'pop',
    'push',
    'reverse',
    'shift',
    'sort',
    'splice',
    'unshift'
  ], function (name) {
    var method = ArrayProto[name];
    _.prototype[name] = function () {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0)
        delete obj[0];
      return result.call(this, obj);
    };
  });
  each([
    'concat',
    'join',
    'slice'
  ], function (name) {
    var method = ArrayProto[name];
    _.prototype[name] = function () {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });
  _.extend(_.prototype, {
    chain: function () {
      this._chain = true;
      return this;
    },
    value: function () {
      return this._wrapped;
    }
  });
}.call(this));
;
(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    window.purl = factory();
  }
}(function () {
  var tag2attr = {
      a: 'href',
      img: 'src',
      form: 'action',
      base: 'href',
      script: 'src',
      iframe: 'src',
      link: 'href'
    }, key = [
      'source',
      'protocol',
      'authority',
      'userInfo',
      'user',
      'password',
      'host',
      'port',
      'relative',
      'path',
      'directory',
      'file',
      'query',
      'fragment'
    ], aliases = { 'anchor': 'fragment' }, parser = {
      strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
      loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }, isint = /^[0-9]+$/;
  function parseUri(url, strictMode) {
    var str = decodeURI(url), res = parser[strictMode || false ? 'strict' : 'loose'].exec(str), uri = {
        attr: {},
        param: {},
        seg: {}
      }, i = 14;
    while (i--) {
      uri.attr[key[i]] = res[i] || '';
    }
    uri.param['query'] = parseString(uri.attr['query']);
    uri.param['fragment'] = parseString(uri.attr['fragment']);
    uri.seg['path'] = uri.attr.path.replace(/^\/+|\/+$/g, '').split('/');
    uri.seg['fragment'] = uri.attr.fragment.replace(/^\/+|\/+$/g, '').split('/');
    uri.attr['base'] = uri.attr.host ? (uri.attr.protocol ? uri.attr.protocol + '://' + uri.attr.host : uri.attr.host) + (uri.attr.port ? ':' + uri.attr.port : '') : '';
    return uri;
  }
  function getAttrName(elm) {
    var tn = elm.tagName;
    if (typeof tn !== 'undefined')
      return tag2attr[tn.toLowerCase()];
    return tn;
  }
  function promote(parent, key) {
    if (parent[key].length === 0)
      return parent[key] = {};
    var t = {};
    for (var i in parent[key])
      t[i] = parent[key][i];
    parent[key] = t;
    return t;
  }
  function parse(parts, parent, key, val) {
    var part = parts.shift();
    if (!part) {
      if (isArray(parent[key])) {
        parent[key].push(val);
      } else if ('object' == typeof parent[key]) {
        parent[key] = val;
      } else if ('undefined' == typeof parent[key]) {
        parent[key] = val;
      } else {
        parent[key] = [
          parent[key],
          val
        ];
      }
    } else {
      var obj = parent[key] = parent[key] || [];
      if (']' == part) {
        if (isArray(obj)) {
          if ('' !== val)
            obj.push(val);
        } else if ('object' == typeof obj) {
          obj[keys(obj).length] = val;
        } else {
          obj = parent[key] = [
            parent[key],
            val
          ];
        }
      } else if (~part.indexOf(']')) {
        part = part.substr(0, part.length - 1);
        if (!isint.test(part) && isArray(obj))
          obj = promote(parent, key);
        parse(parts, obj, part, val);
      } else {
        if (!isint.test(part) && isArray(obj))
          obj = promote(parent, key);
        parse(parts, obj, part, val);
      }
    }
  }
  function merge(parent, key, val) {
    if (~key.indexOf(']')) {
      var parts = key.split('[');
      parse(parts, parent, 'base', val);
    } else {
      if (!isint.test(key) && isArray(parent.base)) {
        var t = {};
        for (var k in parent.base)
          t[k] = parent.base[k];
        parent.base = t;
      }
      if (key !== '') {
        set(parent.base, key, val);
      }
    }
    return parent;
  }
  function parseString(str) {
    return reduce(String(str).split(/&|;/), function (ret, pair) {
      try {
        pair = decodeURIComponent(pair.replace(/\+/g, ' '));
      } catch (e) {
      }
      var eql = pair.indexOf('='), brace = lastBraceInKey(pair), key = pair.substr(0, brace || eql), val = pair.substr(brace || eql, pair.length);
      val = val.substr(val.indexOf('=') + 1, val.length);
      if (key === '') {
        key = pair;
        val = '';
      }
      return merge(ret, key, val);
    }, { base: {} }).base;
  }
  function set(obj, key, val) {
    var v = obj[key];
    if (typeof v === 'undefined') {
      obj[key] = val;
    } else if (isArray(v)) {
      v.push(val);
    } else {
      obj[key] = [
        v,
        val
      ];
    }
  }
  function lastBraceInKey(str) {
    var len = str.length, brace, c;
    for (var i = 0; i < len; ++i) {
      c = str[i];
      if (']' == c)
        brace = false;
      if ('[' == c)
        brace = true;
      if ('=' == c && !brace)
        return i;
    }
  }
  function reduce(obj, accumulator) {
    var i = 0, l = obj.length >> 0, curr = arguments[2];
    while (i < l) {
      if (i in obj)
        curr = accumulator.call(undefined, curr, obj[i], i, obj);
      ++i;
    }
    return curr;
  }
  function isArray(vArg) {
    return Object.prototype.toString.call(vArg) === '[object Array]';
  }
  function keys(obj) {
    var key_array = [];
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop))
        key_array.push(prop);
    }
    return key_array;
  }
  function purl(url, strictMode) {
    if (arguments.length === 1 && url === true) {
      strictMode = true;
      url = undefined;
    }
    strictMode = strictMode || false;
    url = url || window.location.toString();
    return {
      data: parseUri(url, strictMode),
      attr: function (attr) {
        attr = aliases[attr] || attr;
        return typeof attr !== 'undefined' ? this.data.attr[attr] : this.data.attr;
      },
      param: function (param) {
        return typeof param !== 'undefined' ? this.data.param.query[param] : this.data.param.query;
      },
      fparam: function (param) {
        return typeof param !== 'undefined' ? this.data.param.fragment[param] : this.data.param.fragment;
      },
      segment: function (seg) {
        if (typeof seg === 'undefined') {
          return this.data.seg.path;
        } else {
          seg = seg < 0 ? this.data.seg.path.length + seg : seg - 1;
          return this.data.seg.path[seg];
        }
      },
      fsegment: function (seg) {
        if (typeof seg === 'undefined') {
          return this.data.seg.fragment;
        } else {
          seg = seg < 0 ? this.data.seg.fragment.length + seg : seg - 1;
          return this.data.seg.fragment[seg];
        }
      }
    };
  }
  purl.jQuery = function ($) {
    if ($ != null) {
      $.fn.url = function (strictMode) {
        var url = '';
        if (this.length) {
          url = $(this).attr(getAttrName(this[0])) || '';
        }
        return purl(url, strictMode);
      };
      $.url = purl;
    }
  };
  purl.jQuery(window.jQuery);
  return purl;
}));
'use strict';
angular.module('adn', []);
'use strict';
angular.module('adn').provider('ADNConfig', function () {
  this.configuation = {};
  this.$get = function () {
    return {
      config: this.configuation,
      get: function (key, defaultValue) {
        if (this.config.hasOwnProperty(key)) {
          return this.config[key];
        }
        return defaultValue;
      }
    };
  };
  this.setConfig = function (conf) {
    this.configuation = angular.extend({}, this.configuation, conf);
  };
});
'use strict';
angular.module('adn').factory('Auth', [
  '$rootScope',
  '$location',
  function ($rootScope, $location) {
    $rootScope.local = JSON.parse(typeof localStorage.data !== 'undefined' ? localStorage.data : '{}');
    $rootScope.$watch('local', function () {
      localStorage.data = JSON.stringify($rootScope.local);
    }, true);
    return {
      isLoggedIn: function (local) {
        if (local === undefined) {
          local = $rootScope.local;
        }
        return local && typeof local.accessToken !== 'undefined';
      },
      logout: function () {
        $rootScope.local = {};
        localStorage.clear();
      },
      login: function () {
        $rootScope.local.accessToken = $rootScope.local.accessToken || jQuery.url($location.absUrl()).fparam('access_token');
        $location.hash('');
      }
    };
  }
]);
'use strict';
angular.module('adn').factory('ApiClient', [
  '$rootScope',
  '$http',
  'ADNConfig',
  function ($rootScope, $http, ADNConfig) {
    var methods = [
        'get',
        'head',
        'post',
        'put',
        'delete',
        'jsonp'
      ];
    var dispatch = function (method) {
      return function (conf) {
        conf.headers = conf.headers || {};
        if ($rootScope.local && $rootScope.local.accessToken) {
          conf.headers.Authorization = 'Bearer ' + $rootScope.local.accessToken;
        }
        conf.url = ADNConfig.get('api_client_root', 'https://alpha-api.app.net/stream/0/') + conf.url;
        conf.method = method;
        if (method === 'post' && conf.data && !conf.headers['Content-Type']) {
          conf.data = jQuery.param(conf.data);
          conf.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
        return $http(conf);
      };
    };
    var apiClient = {};
    _.each(methods, function (m) {
      apiClient[m] = dispatch(m);
    });
    apiClient.postJson = function (conf) {
      conf.headers = conf.headers || {};
      conf.headers['Content-Type'] = 'application/json';
      if (!angular.isString(conf.data) && angular.isObject(conf.data) || angular.isArray(conf.data)) {
        conf.data = angular.toJson(conf.data);
      }
      return apiClient.post(conf);
    };
    return apiClient;
  }
]);
'use strict';
var yella = angular.module('yellaApp', ['adn']);
yella.config([
  '$routeProvider',
  '$locationProvider',
  'ADNConfigProvider',
  function ($routeProvider, $locationProvider, ADNConfigProvider) {
    $routeProvider.when('/beer/:post_id/', {
      templateUrl: '/views/post_detail.html',
      controller: 'PostDetailCtrl'
    });
    $routeProvider.when('/', {
      templateUrl: '/views/main.html',
      controller: 'MainCtrl'
    });
    $routeProvider.otherwise({ redirectTo: '/' });
    $locationProvider.hashPrefix('#');
    $locationProvider.html5Mode(true);
    ADNConfigProvider.setConfig({ api_client_root: 'https://alpha-api.app.net/stream/0/' });
  }
]);
yella.run([
  '$rootScope',
  '$location',
  'ADNConfig',
  'Auth',
  function ($rootScope, $location, ADNConfig, Auth) {
    $rootScope.client_id = '7xSu3a32vnSPzDmuMEcdLnNwkwVELDCB';
    $rootScope.redirect_uri = window.location.origin;
    Auth.login();
    console.log('yoyooyoy');
  }
]);
(function (exports) {
  var SUBDOMAINS = 'a. b. c. d.'.split(' '), MAKE_PROVIDER = function (layer, type, minZoom, maxZoom) {
      return {
        'url': [
          'https://stamen-tiles-{S}a.ssl.fastly.net/',
          layer,
          '/{Z}/{X}/{Y}.',
          type
        ].join(''),
        'type': type,
        'subdomains': SUBDOMAINS.slice(),
        'minZoom': minZoom,
        'maxZoom': maxZoom,
        'attribution': [
          'Map tiles by <a href="http://stamen.com">Stamen Design</a>, ',
          'under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. ',
          'Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, ',
          'under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
        ].join('')
      };
    }, PROVIDERS = {
      'toner': MAKE_PROVIDER('toner', 'png', 0, 20),
      'terrain': MAKE_PROVIDER('terrain', 'jpg', 4, 18),
      'watercolor': MAKE_PROVIDER('watercolor', 'jpg', 1, 16),
      'trees-cabs-crime': {
        'url': 'http://{S}.tiles.mapbox.com/v3/stamen.trees-cabs-crime/{Z}/{X}/{Y}.png',
        'type': 'png',
        'subdomains': 'a b c d'.split(' '),
        'minZoom': 11,
        'maxZoom': 18,
        'extent': [
          {
            'lat': 37.853,
            'lon': -122.577
          },
          {
            'lat': 37.684,
            'lon': -122.313
          }
        ],
        'attribution': [
          'Design by Shawn Allen at <a href="http://stamen.com">Stamen</a>.',
          'Data courtesy of <a href="http://fuf.net">FuF</a>,',
          '<a href="http://www.yellowcabsf.com">Yellow Cab</a>',
          '&amp; <a href="http://sf-police.org">SFPD</a>.'
        ].join(' ')
      }
    };
  setupFlavors('toner', [
    'hybrid',
    'labels',
    'lines',
    'background',
    'lite'
  ]);
  setupFlavors('toner', ['2010']);
  setupFlavors('toner', [
    '2011',
    '2011-lines',
    '2011-labels',
    '2011-lite'
  ]);
  setupFlavors('terrain', ['background']);
  setupFlavors('terrain', [
    'labels',
    'lines'
  ], 'png');
  exports.stamen = exports.stamen || {};
  exports.stamen.tile = exports.stamen.tile || {};
  exports.stamen.tile.providers = PROVIDERS;
  exports.stamen.tile.getProvider = getProvider;
  function setupFlavors(base, flavors, type) {
    var provider = getProvider(base);
    for (var i = 0; i < flavors.length; i++) {
      var flavor = [
          base,
          flavors[i]
        ].join('-');
      PROVIDERS[flavor] = MAKE_PROVIDER(flavor, type || provider.type, provider.minZoom, provider.maxZoom);
    }
  }
  function getProvider(name) {
    if (name in PROVIDERS) {
      return PROVIDERS[name];
    } else {
      throw 'No such provider (' + name + ')';
    }
  }
  if (typeof MM === 'object') {
    var ModestTemplate = typeof MM.Template === 'function' ? MM.Template : MM.TemplatedMapProvider;
    MM.StamenTileLayer = function (name) {
      var provider = getProvider(name);
      this._provider = provider;
      MM.Layer.call(this, new ModestTemplate(provider.url, provider.subdomains));
      this.provider.setZoomRange(provider.minZoom, provider.maxZoom);
      this.attribution = provider.attribution;
    };
    MM.StamenTileLayer.prototype = {
      setCoordLimits: function (map) {
        var provider = this._provider;
        if (provider.extent) {
          map.coordLimits = [
            map.locationCoordinate(provider.extent[0]).zoomTo(provider.minZoom),
            map.locationCoordinate(provider.extent[1]).zoomTo(provider.maxZoom)
          ];
          return true;
        } else {
          return false;
        }
      }
    };
    MM.extend(MM.StamenTileLayer, MM.Layer);
  }
  if (typeof L === 'object') {
    L.StamenTileLayer = L.TileLayer.extend({
      initialize: function (name) {
        var provider = getProvider(name), url = provider.url.replace(/({[A-Z]})/g, function (s) {
            return s.toLowerCase();
          });
        L.TileLayer.prototype.initialize.call(this, url, {
          'minZoom': provider.minZoom,
          'maxZoom': provider.maxZoom,
          'subdomains': provider.subdomains,
          'scheme': 'xyz',
          'attribution': provider.attribution
        });
      }
    });
  }
  if (typeof OpenLayers === 'object') {
    function openlayerize(url) {
      return url.replace(/({.})/g, function (v) {
        return '$' + v.toLowerCase();
      });
    }
    OpenLayers.Layer.Stamen = OpenLayers.Class(OpenLayers.Layer.OSM, {
      initialize: function (name, options) {
        var provider = getProvider(name), url = provider.url, subdomains = provider.subdomains, hosts = [];
        if (url.indexOf('{S}') > -1) {
          for (var i = 0; i < subdomains.length; i++) {
            hosts.push(openlayerize(url.replace('{S}', subdomains[i])));
          }
        } else {
          hosts.push(openlayerize(url));
        }
        options = OpenLayers.Util.extend({
          'numZoomLevels': provider.maxZoom,
          'buffer': 0,
          'transitionEffect': 'resize',
          'tileOptions': { 'crossOriginKeyword': null }
        }, options);
        return OpenLayers.Layer.OSM.prototype.initialize.call(this, name, hosts, options);
      }
    });
  }
  if (typeof google === 'object' && typeof google.maps === 'object') {
    google.maps.StamenMapType = function (name) {
      var provider = getProvider(name), subdomains = provider.subdomains;
      return google.maps.ImageMapType.call(this, {
        'getTileUrl': function (coord, zoom) {
          var numTiles = 1 << zoom, wx = coord.x % numTiles, x = wx < 0 ? wx + numTiles : wx, y = coord.y, index = (zoom + x + y) % subdomains.length;
          return provider.url.replace('{S}', subdomains[index]).replace('{Z}', zoom).replace('{X}', x).replace('{Y}', y);
        },
        'tileSize': new google.maps.Size(256, 256),
        'name': name,
        'minZoom': provider.minZoom,
        'maxZoom': provider.maxZoom
      });
    };
    google.maps.StamenMapType.prototype = new google.maps.ImageMapType('_');
  }
}(typeof exports === 'undefined' ? this : exports));
'use strict';
angular.module('yellaApp').service('Leaflet', [
  'ApiClient',
  function (ApiClient) {
    var map;
    var this_ = this;
    this.centerIcon = L.divIcon({ className: 'my-div-icon' });
    this.initmap = function () {
      map = new L.Map('map');
      this_.map = map;
      var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      var osmUrl = 'https://{s}.tiles.mapbox.com/v3/examples.map-szwdot65/{z}/{x}/{y}.png';
      var osmAttrib = 'Map data \xa9 OpenStreetMap contributors';
      var osm = new L.TileLayer(osmUrl, {
          minZoom: 3,
          maxZoom: 15,
          attribution: osmAttrib
        });
      var layer = new L.StamenTileLayer('toner-lite');
      map.setView([
        39.5,
        -98.35
      ], 5);
      map.addLayer(osm);
      var greenIcon = L.icon({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.6.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.6.4/images/marker-shadow.png'
        });
      navigator.geolocation.getCurrentPosition(function (pos) {
        map.setView([
          pos.coords.latitude,
          pos.coords.longitude
        ], 9);
      });
      ApiClient.get({ url: 'posts/stream/explore/checkins?include_annotations=1' }).success(function (resp) {
        _.each(resp.data, function (post) {
          _.each(post.annotations, function (annotation) {
            if (annotation.type === 'net.app.core.checkin') {
              L.marker([
                annotation.value.latitude,
                annotation.value.longitude
              ], { icon: greenIcon }).addTo(map);
            }
          });
        });
      });
    };
  }
]);
'use strict';
angular.module('yellaApp').controller('MainCtrl', [
  '$rootScope',
  '$scope',
  '$http',
  'ApiClient',
  'Leaflet',
  '$location',
  function ($rootScope, $scope, $http, ApiClient, Leaflet, $location) {
    Leaflet.initmap();
    var marker;
    Leaflet.map.on('click', function (e) {
      if (marker) {
        console.log('updating', marker.update(e.latlng));
        marker.setLatLng(e.latlng);
      } else {
        marker = L.marker(e.latlng, { icon: Leaflet.centerIcon }).addTo(Leaflet.map);
      }
      $scope.$apply(function () {
        $scope.current_location = e.latlng;
      });
    });
    $scope.beer = null;
    $scope.removeBeer = function () {
      $scope.beer = null;
      return false;
    };
    var initTypeAhead = function () {
      jQuery('input.typeahead-beer').typeahead([{
          name: 'beers',
          remote: {
            url: '/api-proxy/search/beer?q=%QUERY',
            filter: function (data) {
              return _.map(data.response.beers.items, function (val) {
                var img = '<img class="media-object" width="45px" height="45px" src="' + val.beer.beer_label + '">';
                var pull_right = '<span class="pull-right">' + img + '</span>';
                var media_body = '<div class="media-body"><h4 class="media-heading">' + val.beer.beer_name + '</h4>' + val.brewery.brewery_name + '</div>';
                var media = '<div class="media beer-body">' + pull_right + media_body + '</div>';
                val.value = media;
                return val;
              });
            }
          }
        }]);
      jQuery('input.typeahead-beer').on('typeahead:selected', function (e, datum) {
        $scope.$apply(function () {
          $scope.beer = datum;
          console.log(datum);
        });
      });
      jQuery('input.typeahead-location').typeahead([{
          name: 'location',
          remote: {
            url: 'https://alpha-api.app.net/stream/0/places/search?q=%QUERY',
            maxParallelRequests: 2,
            replace: function (url, uriEncodedQuery) {
              var center = Leaflet.map.getCenter();
              var bounds = Leaflet.map.getBounds();
              center = $scope.current_location || center;
              var params = {
                  access_token: $rootScope.local.accessToken,
                  latitude: center.lat,
                  longitude: center.lng,
                  radius: 1000
                };
              return 'https://alpha-api.app.net/stream/0/places/search?' + jQuery.param(params) + '&q=' + uriEncodedQuery;
            },
            filter: function (data) {
              console.log(data);
              return _.map(data.data, function (val) {
                var city = val.locality;
                var state = val.region;
                var area = '';
                if (city) {
                  area = city + ', ';
                }
                if (state) {
                  area = area + state;
                }
                val.value = '<h4 class="media-heading">' + val.name + '</h4>' + area;
                return val;
              });
            }
          }
        }]);
      jQuery('input.typeahead-location').on('typeahead:selected', function (e, datum) {
        $scope.$apply(function () {
          $scope.location = datum;
        });
      });
    };
    initTypeAhead();
    $scope.checkin = function () {
      $http.get('/api-proxy/beer/info/' + $scope.beer.beer.bid).success(function (resp) {
        $scope.media = resp.response.beer.media.items;
        console.log($scope.media);
        jQuery('[data-image-picker]').modal('show');
      });
    };
    $scope.selectImage = function (image) {
      jQuery('[data-image-picker]').modal('hide');
      var message = {
          text: 'A ' + $scope.beer.beer.beer_name + ' @ ' + $scope.location.name,
          annotations: [
            {
              type: 'net.app.food',
              value: {
                name: $scope.beer.beer.beer_name,
                vendor: $scope.beer.brewery.brewery_name,
                thumbnail_image: $scope.beer.beer_label,
                thumbnail_width: '100',
                thumbnail_height: '100'
              }
            },
            {
              type: 'net.app.core.oembed',
              value: {
                version: '1.0',
                type: 'photo',
                width: 640,
                height: 640,
                title: $scope.beer.beer.beer_name,
                thumbnail_url: image.photo.photo_img_lg,
                thumbnail_width: 640,
                thumbnail_height: 640,
                url: image.photo.photo_img_lg,
                embeddable_url: 'https://adn-beers.appspot.com/beer/{post_id}/'
              }
            },
            {
              type: 'net.app.core.checkin',
              value: { '+net.app.core.place': { factual_id: $scope.location.factual_id } }
            }
          ]
        };
      var post_message = _.extend({}, message);
      post_message.text = post_message.text + ' \u2014 https://adn-beers.appspot.com/beer/{post_id}/';
      ApiClient.post({
        url: 'posts',
        headers: { 'Content-Type': 'application/json' },
        data: angular.toJson(post_message)
      }).success(function (resp) {
        if ($scope.use_ohai_journal) {
          var message_message = _.extend({}, message);
          message_message.text = message_message.text + ' - ' + resp.data.canonical_url;
          message_message.annotations[1].value.embeddable_url = resp.data.canonical_url;
          ApiClient.post({
            url: 'channels/' + $scope.ohai_journal.id + '/messages',
            headers: { 'Content-Type': 'application/json' },
            data: angular.toJson(message_message)
          }).success(function () {
            delete $scope.location;
            delete $scope.beer;
            jQuery('.typeahead-beer').val('');
            jQuery('.typeahead-location').val('');
            window.setTimeout(function () {
              $location.path('/beer/' + resp.data.id + '/');
            }, 200);
          });
        } else {
          delete $scope.location;
          delete $scope.beer;
          jQuery('.typeahead-beer').val('');
          jQuery('.typeahead-location').val('');
          $location.path('/beer/' + resp.data.id + '/');
          window.setTimeout(function () {
            $location.path('/beer/' + resp.data.id + '/');
          }, 200);
        }
      });
    };
    ApiClient.get({
      url: 'users/me/channels',
      params: { 'channel_types': 'net.app.ohai.journal' }
    }).success(function (data) {
      console.log(data);
      var your_channel;
      _.each(data.data, function (channel) {
        if (channel.writers.you && channel.writers.immutable && channel.writers.user_ids.length === 0) {
          your_channel = channel;
        }
      });
      $scope.ohai_journal = your_channel;
    });
  }
]);
'use strict';
angular.module('yellaApp').controller('PostDetailCtrl', [
  '$scope',
  'Leaflet',
  '$routeParams',
  'ApiClient',
  function ($scope, Leaflet, $routeParams, ApiClient) {
    console.log('yoyoyoy 1');
    Leaflet.initmap();
    console.log('yoyoyoyoyyo', $routeParams.post_id);
    ApiClient.get({
      url: '/posts/' + $routeParams.post_id,
      params: { include_annotations: 1 }
    }).success(function (blah) {
      var post = blah.data;
      _.each(post.annotations, function (obj) {
        if (obj.type === 'net.app.core.oembed') {
          $scope.oembed = obj;
        }
        $scope.post = post;
        console.log(post, $scope.oembed);
      });
    });
  }
]);
angular.module('yellaApp').run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('/views/main.html', '<div id="map"></div>\n' + '<div class="container">\n' + '  <div class="row">\n' + '      <div class="col-lg-6 panel beer-checkin" ng-class=\'{picking_location: beer && !location, location_found: beer && location}\'>\n' + '        <form ng-show=\'local.accessToken && !beer\'>\n' + '          <div class=\'form-group\'>\n' + '            <input type=\'text\' class=\'input-large form-control typeahead-beer\' placeholder=\'What kind of beer are you drinking?\'>\n' + '          </div>\n' + '        </form>\n' + '        <div ng-show=\'local.accessToken && beer\' class=\'selected-beer\'>\n' + '          <div ng-bind-html-unsafe=\'beer.value\'></div>\n' + '          <p><small class=\'text-right\'><a href=\'#remove\' ng-click=\'removeBeer()\'>remove</a></small></p>\n' + '        </div>\n' + '        <form ng-show=\'local.accessToken && beer && !location\'>\n' + '          <div class=\'form-group\'>\n' + '            <input type=\'text\' class=\'input-large form-control typeahead-location\' placeholder=\'Where are you drinking it?\'>\n' + '            <p class=\'help-block\'>\n' + '              <small><b>Click on the map to set your location.</b></small>\n' + '            </p>  \n' + '          </div>\n' + '        </form>\n' + '        <div ng-show=\'local.accessToken && beer && location\' class=\'selected-location\'>\n' + '          <div ng-bind-html-unsafe=\'location.value\'></div>\n' + '          <p><small class=\'text-right\'><a href=\'#remove\' ng-click=\'removeLocation()\'>remove</a></small></p>\n' + '        </div>\n' + '        <p class=\'background\' ng-show=\'local.accessToken && beer && location && ohai_journal\'>\n' + '          <label>\n' + '            <input type=\'checkbox\' ng-model=\'use_ohai_journal\'> Save to my Ohai Journal\n' + '          </label>\n' + '        </p>\n' + '        <p class="text-center" ng-show=\'local.accessToken && beer && location\'>\n' + '            <button type="submit" class="btn btn-success btn-large btn-block" ng-click=\'checkin()\' ng-disabled=\'!beer\'>Check In</button>\n' + '        </p>\n' + '        <form ng-hide=\'local.accessToken\'>\n' + '          <p class=\'background\'>\n' + '            To start checking into beers you must first login, or create an account.<br>\n' + '            It asks for the messages scope so that it can publish to your <a href=\'http://ohaiapp.net/\' target=\'_blank\'>Ohai</a> journal, if you have one.</p>\n' + '          <p class="text-center">\n' + '            <a type="submit" ng-href=\'https://account.app.net/oauth/authenticate?client_id={{client_id}}&scopes=write_post%20messages&response_type=token&redirect_uri={{redirect_uri}}\' class="btn btn-success btn-large btn-block">Authorize With App.net</a>\n' + '          </p>\n' + '        </form>\n' + '\n' + '      </div><!-- //main content -->\n' + '      <div class="modal fade image-selector"  data-image-picker data-backdrop=\'false\'>\n' + '        <div class="modal-dialog">\n' + '          <div class="modal-content">\n' + '            <div class="modal-header">\n' + '              <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>\n' + '              <h4 class="modal-title">Choose an Image</h4>\n' + '            </div>\n' + '            <div class="modal-body">\n' + '              <span ng-repeat=\'image in media\' class=\'image\'>\n' + '                <a href=\'#\' ng-click=\'selectImage(image)\'>\n' + '                  <img ng-src=\'{{ image.photo.photo_img_lg }}\' width=\'260px\' height=\'260px\'>\n' + '                </a>\n' + '              </span>\n' + '            </div>\n' + '            <div class="modal-footer">\n' + '              <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\n' + '            </div>\n' + '          </div><!-- /.modal-content -->\n' + '        </div><!-- /.modal-dialog -->\n' + '      </div><!-- /.modal -->\n' + '  </div><!-- //row -->\n' + '</div> <!-- //container -->');
    $templateCache.put('/views/post_detail.html', '<div id="map"></div>\n' + '<div class="container">\n' + '  <div class="row">\n' + '    <div class="col-lg-6 panel beer-detail" ng-class=\'\'>\n' + '      <div class=\'selected-location\'>\n' + '        <div ng-bind-html-unsafe=\'post.html\'></div>\n' + '        <img width=\'450px\' height=\'450px\' ng-src=\'{{oembed.value.thumbnail_url}}\'>\n' + '      </div>\n' + '    </div>\n' + '  </div>\n' + '</div> <!-- //container -->');
  }
]);