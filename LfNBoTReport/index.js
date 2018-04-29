/*
	BOT Report Discord par @raymater
	
	Documentation Discord.js : https://discord.js.org
*/

var Discord = require("discord.js");
var bot = new Discord.Client();

var token = "NDI5NzQ1ODg4MTUyNTE4Njcx.Da5_fA.GloqYSvp908GXceRGmgfxBqRh64";

var dernierAppel = new Array(); // Matrice stockant le timestamp du dernier appel de la commande + UserID l'ayant appelé

bot.on("ready", () => {
	console.log("Bot démarré");
});

bot.on("guildMemberAdd", member => {
    member.guild.channels.find("name", "📈à-rejoin📈").send(`**Bienvenue à** __**${member.guild.name}**__ **maintenant __**${member.user.username}**__ est avec nous!`)
})

bot.on("guildMemberRemove", member => {
    member.guild.channels.find("name", "📉à-quitter📉").send(`__**${member.user.username}**__ **n'est plus sur notre serveur** __**${member.guild.name}**__`)
})

bot.on('guildMemberAdd', member => {
    var role = member.guild.roles.find("name", "✓NDNG✓");
    member.addRole(role)
})

bot.on('guildMemberAdd', function (member) {
    member.createDM().then(function (channel) {
        return channel.send('__***:heavy_check_mark::red_circle:BIENVENUE:red_circle::heavy_check_mark:***__\n***Pour les commandes***\n-help')
 
    }).catch(console.error)
})

bot.on("message", (message) => {
	
	/*
		Object message :
		
		- mentions.users = utilisateurs mentionnés
		- author.username = auteur du message
		- content = contenu du message
		- createdTimestamp = timestamp du message
		- member.guild.name = nom du serveur
		- channel.name = nom du topic
		- channel.topic = description du topic
		- channel.guild.roles = rôles sur le serveur
	*/
	
	if(message.content.substring(0, 7) == "-report")
	{
		var commande = message.content.split(" ");
		
		if(typeof commande[1] === 'undefined')
		{
			if(message.author.bot === false)
			{
				// Nom d'utilisateur pas entré = afficher l'aide
				message.reply("**Aide pour la commande report :** \n\n Pour rapporter un ou plusieurs utilisateurs ayant un comportement inapproprié, mettre le nom ou les noms des utilisateurs après la commande report. \n\n Vous pouvez également rajouter une raison particulière avec l'attribut `-r:\"Votre raison\"`. \n\n Ne vous amusez pas à abuser cette commande à tout va, merci :wink: ! \n\n **Exemple 1 :** `!report @user` \n **Exemple 2 :** `!report @user1 @user2` \n **Exemple 3 :** `!report @user1 -r:\"Une raison\"`");
			}
		}
		else
		{
			// Vérifier les noms + raison de signalement
			var verifNom = true;
			var raisonSignalement = null;
			var inOptionRaison = false;
			
			for(var i = 1; i < commande.length; i++)
			{
				// Les noms des personnes citées commencent par "<", le caractère suivant étant @
				if(commande[i].charAt(1) !== "@")
				{
					// On ne prend pas en compte l'option -r (raison)
					if(commande[i].substring(0, 4) == "-r:\"")
					{
						raisonSignalement = commande[i].substring(3);
						inOptionRaison = true;
					}
					else
					{
						if(inOptionRaison == false)
						{	
							verifNom = false;
						}
						else
						{
							raisonSignalement = raisonSignalement + " " + commande[i];
						}
					}
				}
			}
			
			if(verifNom === true)
			{
				// Vérification des abus
				var aAppele = false;
				for(var i = 0; i < dernierAppel.length; i++)
				{
					if(dernierAppel[i][0] == message.author.id)
					{
						// Un signalement toutes les 3 minutes autorisé
						if((message.createdTimestamp - dernierAppel[i][1]) < 180000)
						{
							aAppele = true;
						}
						else
						{
							aAppele = false;
							dernierAppel.splice(i, 1);
						}
					}
				}
				
				if(aAppele == false)
				{
					dernierAppel.push([message.author.id, message.createdTimestamp]);
					
					var moderateurs = new Array();
					
					var sontAvertis = true;
					
					message.channel.guild.roles.forEach(function(role)
					{
						// Chercher les modérateurs parmi tous les rôles
						
						if (role.hasPermission('BAN_MEMBERS'))
						{
							role.members.forEach(function(member)
							{
								var estDejaPrevenu = false;
								for(var j = 0; j < moderateurs.length; j++)
								{
									if(member == moderateurs[j])
									{
										// Est déjà prévenu
										estDejaPrevenu = true;
									}
								}
									
								if(estDejaPrevenu == false)
								{
									moderateurs.push(member);
								
									// Fonction conversion timestamp -> Date
									function timeConverter(timestamp)
									{
										var a = new Date(timestamp);
										var tabMois = ['Janv.','Févr.','Mars','Avri.','Mai.','Juin','Juil.','Août','Sept.','Octo.','Nove.','Déce.'];
										var annee = a.getFullYear();
										var mois = tabMois[a.getMonth()];
										var date = a.getDate();
										var heure = a.getHours();
										var min = a.getMinutes();
										var sec = a.getSeconds();
										var time = "le " + date + ' ' + mois + ' ' + annee + ' à ' + heure + 'h' + min + ':' + sec ;
										return time;
									}
									
									// Reporter les utilisateurs
									var MP = "Un rapport soumis " + timeConverter(message.createdTimestamp) + " par **" + message.author.username + "** a été effectué à l'encontre de ";
									
									message.mentions.users.forEach(function(user)
									{
										MP = MP + "@" + user.username + " ";
									});
									
									MP =  MP + "sur *" + member.guild.name + "/" + message.channel.name + "*";
									
									// Prise en charge de la raison du signalement
									if(raisonSignalement != null)
									{
										MP = MP + " pour la raison suivante : *" + raisonSignalement + "*";
									}
									
									try
									{
										member.user.sendMessage(MP);
									}
									catch(e)
									{
										sontAvertis = false;
									}
								}
							});
						}
					});
					
					if(sontAvertis == true)
					{
						message.reply("Signalement effectué :wink: !");
					}
				}
			}
		}
	}
});

bot.on("message", (message) => {
	
	/*
		Object message :
		
		- mentions.users = utilisateurs mentionnés
		- author.username = auteur du message
		- content = contenu du message
		- createdTimestamp = timestamp du message
		- member.guild.name = nom du serveur
		- channel.name = nom du topic
		- channel.topic = description du topic
		- channel.guild.roles = rôles sur le serveur
	*/
	
	if(message.content.substring(0, 7) == "-raport")
	{
		message.delete (30);
		var commande = message.content.split(" ");
		
		if(typeof commande[1] === 'undefined')
		{
			if(message.author.bot === false)
			{
				// Nom d'utilisateur pas entré = afficher l'aide
				message.reply("**Aide pour la commande report :** \n\n Pour rapporter un ou plusieurs utilisateurs ayant un comportement inapproprié, mettre le nom ou les noms des utilisateurs après la commande report. \n\n Vous pouvez également rajouter une raison particulière avec l'attribut `-r:\"Votre raison\"`. \n\n Ne vous amusez pas à abuser cette commande à tout va, merci :wink: ! \n\n **Exemple 1 :** `!report @user` \n **Exemple 2 :** `!report @user1 @user2` \n **Exemple 3 :** `!report @user1 -r:\"Une raison\"`").then(d_msg => { d_msg.delete(8990); });
			}
		}
		else
		{
			// Vérifier les noms + raison de signalement
			var verifNom = true;
			var raisonSignalement = null;
			var inOptionRaison = false;
			
			for(var i = 1; i < commande.length; i++)
			{
				// Les noms des personnes citées commencent par "<", le caractère suivant étant @
				if(commande[i].charAt(1) !== "@")
				{
					message.delete (30);
					// On ne prend pas en compte l'option -r (raison)
					if(commande[i].substring(0, 4) == "-r:\"")
					{
						raisonSignalement = commande[i].substring(3);
						inOptionRaison = true;
					}
					else
					{
						if(inOptionRaison == false)
						{	
							verifNom = false;
						}
						else
						{
							raisonSignalement = raisonSignalement + " " + commande[i];
						}
					}
				}
			}
			
			if(verifNom === true)
			{
				// Vérification des abus
				var aAppele = false;
				for(var i = 0; i < dernierAppel.length; i++)
				{
					if(dernierAppel[i][0] == message.author.id)
					{
						// Un signalement toutes les 3 minutes autorisé
						if((message.createdTimestamp - dernierAppel[i][1]) < 180000)
						{
							aAppele = true;
						}
						else
						{
							aAppele = false;
							dernierAppel.splice(i, 1);
						}
					}
				}
				
				if(aAppele == false)
				{
					dernierAppel.push([message.author.id, message.createdTimestamp]).then(d_msg => { d_msg.delete(8990); });
					
					var moderateurs = new Array();
					
					var sontAvertis = true;
					
					message.channel.guild.roles.forEach(function(role)
					{
						// Chercher les modérateurs parmi tous les rôles
						
						if (role.hasPermission('BAN_MEMBERS'))
						{
							role.members.forEach(function(member)
							{
								var estDejaPrevenu = false;
								for(var j = 0; j < moderateurs.length; j++)
								{
									if(member == moderateurs[j])
									{
										// Est déjà prévenu
										estDejaPrevenu = true;
									}
								}
									
								if(estDejaPrevenu == false)
								{
									moderateurs.push(member);
								
									// Fonction conversion timestamp -> Date
									function timeConverter(timestamp)
									{
										var a = new Date(timestamp);
										var tabMois = ['Janv.','Févr.','Mars','Avri.','Mai.','Juin','Juil.','Août','Sept.','Octo.','Nove.','Déce.'];
										var annee = a.getFullYear();
										var mois = tabMois[a.getMonth()];
										var date = a.getDate();
										var heure = a.getHours();
										var min = a.getMinutes();
										var sec = a.getSeconds();
										var time = "le " + date + ' ' + mois + ' ' + annee + ' à ' + heure + 'h' + min + ':' + sec ;
										return time;
									}
									
									// Reporter les utilisateurs
									var MP = "Un rapport soumis " + timeConverter(message.createdTimestamp) + " par **" + message.author.username + "** a été effectué à l'encontre de ";
									
									message.mentions.users.forEach(function(user)
									{
										MP = MP + "@" + user.username + " ";
									});
									
									MP =  MP + "sur *" + member.guild.name + "/" + message.channel.name + "*";
									
									// Prise en charge de la raison du signalement
									if(raisonSignalement != null)
									{
										MP = MP + " pour la raison suivante : *" + raisonSignalement + "*";
									}
									
									try
									{
										member.user.sendMessage(MP);
									}
									catch(e)
									{
										sontAvertis = false;
									}
								}
							});
						}
					});
					
					if(sontAvertis == true)
					{
						message.reply("Signalement effectué :wink: !").then(d_msg => { d_msg.delete(8990); });
					}
				}
			}
		}
	}
});

bot.login(token);
