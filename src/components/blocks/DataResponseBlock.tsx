import React from 'react';
import { DataTable } from './DataTable';
import { QuestionText } from './QuestionText';
import { normalizeLanguage } from '../../utils/languageUtils';

/**
 * DATA RESPONSE
 *
 * Fixed typesetting: a boxed, captioned data source (table and/or a short
 * statement of the data), always printed above the sub-questions that refer to
 * it. Source captions are numbered by a code rule, never by the AI.
 */
export const DataResponseBlock: React.FC<{
  tableData?: any;
  sourceCaption?: string;
  context?: string;
  language?: string;
}> = ({ tableData, sourceCaption, context, language }) => {
  const lang = normalizeLanguage(language);
  const caption = sourceCaption || (lang === 'fr' ? 'Document : données ci-dessous' : 'Source: the data below');

  if (!tableData && !context) return null;

  return (
    <div className="examprint-data-response">
      <div className="examprint-data-response-caption">{caption}</div>
      {context && (
        <div className="examprint-data-response-context">
          <QuestionText text={context} />
        </div>
      )}
      {tableData && <DataTable data={tableData} />}
    </div>
  );
};
