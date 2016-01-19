/**
 * File: jquery.waiter.js
 * Version: 1.0.0
 * Author: Thomas Champion
 *
 * Cette biblioth�que a �t� notifi� au d�but � la fin du t�l�chargement d'un fichier qui est g�n�r� � la suite de la soumission d'un formulaire.
 * Elle fonctionne de la mani�re suivante : 
 * 
 * Lors de la soumission du formulaire, et avant que le formulaire soit envoy� au serveur, un champ hidden contenant un token est g�n�r�e et donc envoy� au serveur.
 * Ce token doit �tre ajout� � la session � la fin du t�l�chargement du fichier, permettant ainsi de savoir qu'il est termin�.
 *
 * Ensuite une requ�te AJAX est �mise en boucle au serveur sur l'url checkingUrl pour v�rifier si le token est pr�sent dans la session :
 * Si c'est le cas, alors le t�l�chargement est termin�e, et la servlet doit renvoy� une r�ponse json "true", la fonction callback endCallback est alors appel�e.
 *
 * __ Param�tres
 *
 *	checkingUrl: url de la servlet qui v�rifie si le t�l�chargement est termin�.
 *	initCallback(form, token, startTime): callback appel�e au d�but du t�l�chargement.
 *	endCallback(form, token, endTime, downloadTime): callback appel�e � la fin du t�l�chargement
 *	tokenField: nom du champ hidden g�n�r� qui contient la valeur du token g�n�r�e (d�faut: _token).
 *	tokenParam: nom du param�tre envoy� avec la valeur du token � l'url checkingUrl (d�faut: token).
 *
 * __ Exemple d'utilisation
 *
 
$(document).ready(function() {
	$('form').waiter({
		checkingUrl : 'tokenChecker.do', 
		initCallback : function() {
			console.log('D�but  du t�l�chargement');
		}, 
		endCallback : function(form, token, endTime, downloadTime) {
			console.log('Fin du t�l�chargement. Dur�e : ' + downloadTime);
		}
	});
});

 * __ Erreurs connues
 *
 * _ Soumission programmatique :
 *
 * Remplacer les window.forms[0].submit() par $(window.forms[0]).submit()
 */
(function($) {
	function Notifier(checkingUrl, tokenParam, form, token, callback, startTime) {
		this.checkingUrl = checkingUrl;
		this.tokenParam = tokenParam;
		this.form = form;
		this.token = token;
		this.callback = callback;
		this.startTime = startTime;
		
		this.config = {};
		this.config[tokenParam] = token;		
	}
	
	/**
	 * Effectue un appel c�t� serveur sur l'url checkingUrl pour v�rifie que le 
	 * t�l�chargement est termin� pour le token courant
	 */
	Notifier.prototype.check = function () {
		var self = this;
		
		setTimeout(function() {
			$.ajax({
			  dataType: "json",
			  url: self.checkingUrl,
			  data: self.config,
			  cache: false
			})
			.success(function(data) {
				/*
				 * Si le t�l�chargement est termin� appel du callback de final
				 */
				if (data) {
					var endTime = new Date().getTime();
					self.callback(self.form, self.token, endTime, endTime - self.startTime);
				} 
				/*
				 * Rappel de la fonction de v�rification
				 */
				else {
					self.check();
				}
			})
			.fail(function() {
				window.console && console.error('Une erreur est survenue lors de l\'appel AJAX de :' + self.checkingUrl);
			});	
		}, 1000);
	};
	
	$.fn.waiter = function(opts) {
		/**
		 * Param�tres
		 */
		var opts = $.extend({
			checkingUrl : window.location,
			initCallback : function(form, token, time) {},
			endCallback : function(form, token, time, downloadTime) {},
			tokenField : '_token',
			tokenParam : 'token'
		}, opts);
		
		return $(this).submit(function() {
			/*
			 * G�n�ration du token � chaque demande de t�l�chargement
			 */
			var _token = Math.random() + new Date().getTime();
			
			/*
			 * Si le champ token existe on change la valeur
			 * sinon on le cr��
			 */
			var $token = $('[name="' + opts.tokenField + '"]', this);
			if ($token.length) {
				$token.val(_token);
			} else {
				$('<input type="hidden" name="' + opts.tokenField + '" value="' + _token + '" />')
				.appendTo(this);				
			}
			
			var time = new Date().getTime();
			var notifier = new Notifier(opts.checkingUrl, opts.tokenParam, this, _token, opts.endCallback, time);
			
			/*
			 * Appel du callback d'initialisation
			 */
			opts.initCallback(this, _token, time);
			
			/*
			 * Lancement de la boucle d'�coute pour v�rifier si le t�l�chargement est termin�
			 * c�t� serveur
			 */
			notifier.check();
		});
	};
})(jQuery);