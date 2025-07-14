"use client";
import { useEffect, useState } from 'react';
import DocumentSearch from '../../components/DocumentSearch';
import ProcessingStatus from '../../components/ProcessingStatus';
import ContentPreview from '../../components/ContentPreview';
import PublishActions from '../../components/PublishActions';

export default function AdminPage() {
  const [processingId, setProcessingId] = useState(null);
  const [completedId, setCompletedId] = useState(null);
  const [draft, setDraft] = useState(null);

  const startProcessing = async (page) => {
    const res = await fetch(`/api/notion/${page.id}`);
    const docData = await res.json();
    setProcessingId(page.id);
    await fetch('/api/process-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: page.id, doc: JSON.stringify(docData), type: 'notion' })
    });
  };

  const onComplete = () => setCompletedId(processingId);

  useEffect(() => {
    if (!completedId) return;
    (async () => {
      const res = await fetch('/api/get-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: completedId })
      });
      const data = await res.json();
      setDraft(data);
    })();
  }, [completedId]);

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Blog Admin</h1>
      <DocumentSearch onSelect={startProcessing} />
      {processingId && !completedId && <ProcessingStatus id={processingId} onComplete={onComplete} />}
      {draft && <ContentPreview id={completedId} />}
      {draft && <PublishActions id={completedId} draft={draft} />}
    </div>
  );
}