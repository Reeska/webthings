/**
 * File: jquery.waiter.js
 * Version: 1.0.0
 * Author: Thomas Champion
 *
 * Cette bibliothèque a été notifié au début à la fin du téléchargement d'un fichier qui est généré à la suite de la soumission d'un formulaire.
 * Elle fonctionne de la manière suivante : 
 * 
 * Lors de la soumission du formulaire, et avant que le formulaire soit envoyé au serveur, un champ hidden contenant un token est générée et donc envoyé au serveur.
 * Ce token doit être ajouté à la session à la fin du téléchargement du fichier, permettant ainsi de savoir qu'il est terminé.
 *
 * Ensuite une requête AJAX est émise en boucle au serveur sur l'url checkingUrl pour vérifier si le token est présent dans la session :
 * Si c'est le cas, alors le téléchargement est terminée, et la servlet doit renvoyé une réponse json "true", la fonction callback endCallback est alors appelée.
 *
 * __ Paramètres
 *
 *	checkingUrl: url de la servlet qui vérifie si le téléchargement est terminé.
 *	initCallback(form, token, startTime): callback appelée au début du téléchargement.
 *	endCallback(form, token, endTime, downloadTime): callback appelée à la fin du téléchargement
 *	tokenField: nom du champ hidden généré qui contient la valeur du token générée (défaut: _token).
 *	tokenParam: nom du paramètre envoyé avec la valeur du token à l'url checkingUrl (défaut: token).
 *
 * __ Exemple d'utilisation
 *
 
$(document).ready(function() {
	$('form').waiter({
		checkingUrl : 'tokenChecker.do', 
		initCallback : function() {
			console.log('Début  du téléchargement');
		}, 
		endCallback : function(form, token, endTime, downloadTime) {
			console.log('Fin du téléchargement. Durée : ' + downloadTime);
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
	 * Effectue un appel côté serveur sur l'url checkingUrl pour vérifie que le 
	 * téléchargement est terminé pour le token courant
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
				 * Si le téléchargement est terminé appel du callback de final
				 */
				if (data) {
					var endTime = new Date().getTime();
					self.callback(self.form, self.token, endTime, endTime - self.startTime);
				} 
				/*
				 * Rappel de la fonction de vérification
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
		 * Paramètres
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
			 * Génération du token à chaque demande de téléchargement
			 */
			var _token = Math.random() + new Date().getTime();
			
			/*
			 * Si le champ token existe on change la valeur
			 * sinon on le créé
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
			 * Lancement de la boucle d'écoute pour vérifier si le téléchargement est terminé
			 * côté serveur
			 */
			notifier.check();
		});
	};
})(jQuery);