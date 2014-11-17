/*
 * File:        jquery.xtabs.js
 * Version:     1.0.0
 * Author:      Thomas Champion <thchampi@gmail.com>
 * 
 * Plugin servant à gérer des onglets, incluant des onglets imbriquées, mais
 * au le lien entre onglet et URL.
 * Exemple:
 * 
 * [ _Onglet 1_ ] [ Onglet 2 ] [ Onglet 3 ] 
 * 		[ Sous-Onglet 1 ] [ _Sous-Onglet 2_ ] [ Sous-Onglet 3 ] *
 * 
 * L'URL pour l'onglet "Sous-Onglet 2" sera: domain.tld/page#/onglet1/sousonglet2
 * 
 * <ul><li><a href="#/onglet1">Onglet 1</a></li>...</ul>
 * 
 * <div class="onglet1">
 * 		<ul>...<li><a href="#/onglet1/sousonglet2">Sous-Onglet 2</a></li>...</ul>
 * 
 * 		<div class="sousonglet2">
 * 
 * 		</div>
 * </div>
 * 
 * $('.tabs-nav li').xtabs();
 */

(function($) {
	var defaults = {
		activeClass : 'active',
		pathAttribute : 'href',
		pathOwner : 'a',
		selectTabEvent : 'selectedTab',
		selectFirst : true
	};
	
	function TabManager($tabs, opts) {
		var _self = this;
		this.selector = $tabs.selector;
		
		/**
		 * Get all active tabs 
		 * 
		 * @return jQuery
		 */
		this.selectedTabs = function() {
			return $tabs.filter('.' + opts.activeClass);
		};
		
		this.pathToSelector = function(path) {
			if (!path) return;
			return path.replace('#', '').replace(/\//g, ' .');
		};
		
		/**
		 * Display tab for this path.
		 * 
		 * @return jQuery Tab shown returned.
		 */
		this.displayTab = function(path) {
			var target = _self.pathToSelector(path),
				$link = $('[' + opts.pathAttribute + '="' + path + '"]');
				
			/*
			 * Active link
			 */
			$link.parents(_self.selector).first().addClass(opts.activeClass);
			
			/*
			 * Show tab content
			 */
			var $tabContent = $(target).show();
			
			if (!$tabContent.length)
				return;
			
			$(document).trigger(opts.selectTabEvent, [$tabContent, $link, path, _self]);
			
			return $tabContent;
		};
		
		this.tabsContent = function() {
			var $contents = $(opts.pathOwner, $tabs).map(function() {
				var $a = $(this);
				var selector = _self.pathToSelector($a.attr(opts.pathAttribute));
				
				if (!selector) return;
				
				var tab = $(selector);
				
				if (tab.length)
					return tab.toArray();
			});
			
			return $contents;
		};
	
		/**
		 * Display all tab hierarchy for this path.
		 * 
		 * @return boolean true if one tab have shown at least. 
		 */
		this.selectTab = function(path) {
			if (!path) return;
			path = path.replace(/^#?\/?/, '');
			if (!path) return;
			
			var paths = path.split(/\//), ariane = '#', $lastTab;
	
			/**
			 * Hide previous tab
			 */
			$tabs.removeClass(opts.activeClass);
			_self.tabsContent().hide();
	
			/**
			 * Show all items in path
			 */
			var shown = false;
			
			$.each(paths, function() {
				ariane += '/' + this;
	
				$lastTab = _self.displayTab(ariane);
				
				if (!shown && $lastTab)
					shown = true;
			});
	
			/**
			 * Display all first sub tab 
			 */
			if ($lastTab && opts.selectFirst) {
				do {
					var subtab = $(_self.selector, $lastTab).find(opts.pathOwner);
	
					if (subtab.length) {
						subtab = subtab.first();
						var target = subtab.attr(opts.pathAttribute);
						
						$lastTab = _self.displayTab(target);
					}
	
				} while (subtab.length > 0);
			}
			
			return shown;
		};
		
		/**
		 * Tab selection initialization: select default tab from hash or select first tab. 
		 */
		this.init = function() {
			if ((!window.location.hash || !_self.selectTab(window.location.hash)) && opts.selectFirst) {
				_self.selectTab($tabs.first().find(opts.pathOwner).attr(opts.pathAttribute));
			}			
		};
	};
	
	$.fn.xtabs = function(options) {
		var opts = $.extend(defaults, options);
		
		var $tabs = $(this);
		var tabManager = new TabManager($tabs, opts);
		
		/*
		 * Default selected tab
		 */
		tabManager.init();		
		
		/*
		 * Select a tab
		 */
		$(opts.pathOwner, $tabs).click(function() {
			tabManager.selectTab($(this).attr(opts.pathAttribute));
		});
		
		return tabManager;
	};
})(jQuery);
