"use client";
import { useState } from 'react';
import DocumentSearch from '../../components/DocumentSearch';
import ProcessingStatus from '../../components/ProcessingStatus';
import ContentPreview from '../../components/ContentPreview';
import PublishActions from '../../components/PublishActions';

export default function AdminPage() {
  const [selected, setSelected] = useState(null);
  const [doc, setDoc] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(null);

  const handleSelect = async (page) => {
    setSelected(page);
    const res = await fetch(`/api/notion/${page.id}`);
    const data = await res.json();
    setDoc(JSON.stringify(data));
  };

  const startProcessing = async () => {
    if (!selected || !doc) return;
    setProcessing(true);
    await fetch('/api/process-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selected.id, doc, type: 'notion' })
    });
  };

  const onComplete = async (id) => {
    const res = await fetch(`/api/drafts/${id}`);
    const data = await res.json();
    setProcessed(data);
    setProcessing(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Notion Publishing Admin</h1>
      <DocumentSearch onSelect={handleSelect} />
      {selected && (
        <div className="mb-4">
          <button
            onClick={startProcessing}
            disabled={processing}
            className="px-4 py-2 bg-indigo-500 text-white rounded"
          >
            {processing ? 'Processing...' : 'Process Document'}
          </button>
        </div>
      )}
      {processing && <ProcessingStatus id={selected.id} onComplete={onComplete} />}
      {processed && (
        <>
          <ContentPreview content={processed.markdown} />
          <PublishActions id={selected.id} meta={processed.meta} markdown={processed.markdown} />
        </>
      )}
    </div>
  );
}