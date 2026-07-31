/// <reference path="../pb_data/types.d.ts" />

onRecordAfterUpdateSuccess((e) => {
    try {
        console.log("========== HOOK ==========");
        console.log("Reservation :", e.record.id);

        const statut = e.record.getString("statut");

        console.log("Statut :", statut);

        // On envoie uniquement si la réservation est confirmée ou refusée
        if (statut !== "Confirmee" && statut !== "Refusee") {
            console.log("Pas d'envoi d'email.");
            return;
        }

        const userId = e.record.getString("utilisateur");

        console.log("Utilisateur :", userId);

        if (!userId) {
            console.log("Aucun utilisateur.");
            return;
        }

        // Recherche utilisateur
        const user = $app.findRecordById("users", userId);

        if (!user) {
            console.log("Utilisateur introuvable.");
            return;
        }

        const email = user.getString("email");

        console.log("Email :", email);

        if (!email) {
            console.log("Email vide.");
            return;
        }

        // Recherche salle
        let salleNom = "Salle";

        const salleId = e.record.getString("salle");

        if (salleId) {
            try {
                const salle = $app.findRecordById("salles", salleId);
                salleNom = salle.getString("nom");
            } catch (_) {}
        }

        // Récupération des dates
        const debut = new Date(e.record.getString("debut"));
        const fin = new Date(e.record.getString("fin"));

        // Format JJ/MM/AA
        const dateReservation = debut.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
        });

        // Format HH:MM
        const heureDebut = debut.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
        });

        const heureFin = fin.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
        });

        // Sujet
        const sujet =
            statut === "Confirmee"
                ? "Réservation confirmée - UniSalle"
                : "Réservation refusée - UniSalle";

        // Corps HTML
        const corps = `
          <!DOCTYPE html>
          <html>
          <head>
          <meta charset="UTF-8">
          </head>

          <body style="font-family:Arial,sans-serif;color:#333;line-height:1.6;">

          <h2 style="color:#2563eb;">UniSalle</h2>

          <p>Bonjour,</p>

          <p>
          Nous vous informons que votre demande de réservation a été
          <strong>${statut === "Confirmee" ? "confirmée" : "refusée"}</strong>.
          </p>

          ${
              statut === "Refusee"
                  ? `
                  <p>
                      <strong>Motif du refus :</strong><br>
                      <p style="color:#d32f2f;">Salle déjà occupée sur ce créneau.</p>
                  </p>
                  `
                  : ""
          }

          <table style="border-collapse:collapse;">
          <tr>
          <td><strong>Salle :</strong></td>
          <td>${salleNom}</td>
          </tr>

          <tr>
          <td><strong>Date :</strong></td>
          <td>${dateReservation}</td>
          </tr>

          <tr>
          <td><strong>Horaire :</strong></td>
          <td>${heureDebut} - ${heureFin}</td>
          </tr>

          <tr>
          <td><strong>Statut :</strong></td>
          <td>
          ${
              statut === "Confirmee"
                  ? "Confirmée"
                  : "Refusée"
          }
          </td>
          </tr>
          </table>

          <br>

          <p>
          Merci de votre confiance.
          </p>

          <p>
          Cordialement,<br>
          <b>Service de réservation des salles</b><br>
          Université
          </p>

          </body>
          </html>
          `;

        const message = new MailerMessage({
            from: {
                address: $app.settings().meta.senderAddress,
                name: "UniSalle",
            },
            to: [
                {
                    address: email,
                },
            ],
            subject: sujet,
            html: corps,
        });

        $app.newMailClient().send(message);

        console.log("Email envoyé !");
    } catch (err) {
        console.error("Erreur hook :", err);
    }
}, "reservations");