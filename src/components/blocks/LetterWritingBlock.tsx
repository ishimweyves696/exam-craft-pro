import React from 'react';
import { normalizeLanguage } from '../../utils/languageUtils';

/**
 * LETTER WRITING
 *
 * Fixed typesetting: the standard letter skeleton (sender address, date,
 * recipient, salutation, ruled body, closing, signature) printed identically on
 * every paper. Only the number of body lines varies, and it is derived from the
 * marks by a fixed rule.
 */
export const LetterWritingBlock: React.FC<{
  marks?: number;
  language?: string;
  formal?: boolean;
}> = ({ marks = 15, language, formal = true }) => {
  const lang = normalizeLanguage(language);
  const bodyLines = Math.max(10, Math.min(30, Math.round(marks * 1.4)));

  const t =
    lang === 'fr'
      ? {
          sender: "Adresse de l'expéditeur",
          date: 'Date',
          recipient: 'Adresse du destinataire',
          salutation: 'Formule d’appel',
          body: 'Corps de la lettre',
          closing: 'Formule de politesse',
          signature: 'Signature / Nom',
        }
      : {
          sender: "Sender's address",
          date: 'Date',
          recipient: "Recipient's address",
          salutation: 'Salutation',
          body: 'Body of the letter',
          closing: 'Closing',
          signature: 'Signature / Name',
        };

  return (
    <div className="examprint-letter">
      <div className="examprint-letter-head">
        <div className="examprint-letter-block examprint-letter-block--right">
          <span className="examprint-letter-caption">{t.sender}</span>
          <span className="examprint-letter-line" />
          <span className="examprint-letter-line" />
          <span className="examprint-letter-caption">{t.date}</span>
          <span className="examprint-letter-line" />
        </div>
      </div>

      {formal && (
        <div className="examprint-letter-block">
          <span className="examprint-letter-caption">{t.recipient}</span>
          <span className="examprint-letter-line" />
          <span className="examprint-letter-line" />
        </div>
      )}

      <div className="examprint-letter-block">
        <span className="examprint-letter-caption">{t.salutation}</span>
        <span className="examprint-letter-line examprint-letter-line--short" />
      </div>

      <div className="examprint-letter-block">
        <span className="examprint-letter-caption">{t.body}</span>
        {Array.from({ length: bodyLines }).map((_, i) => (
          <span className="examprint-letter-line" key={i} />
        ))}
      </div>

      <div className="examprint-letter-block examprint-letter-block--right">
        <span className="examprint-letter-caption">{t.closing}</span>
        <span className="examprint-letter-line examprint-letter-line--short" />
        <span className="examprint-letter-caption">{t.signature}</span>
        <span className="examprint-letter-line examprint-letter-line--short" />
      </div>
    </div>
  );
};
