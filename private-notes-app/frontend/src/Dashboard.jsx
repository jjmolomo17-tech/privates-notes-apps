import { useState, useEffect } from "react";
import axios from "axios";

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    async function fetchNotes() {
      const res = await axios.get("http://localhost:5000/api/notes", { withCredentials: true });
      setNotes(res.data);
    }
    fetchNotes();
  }, []);

  async function addNote() {
    await axios.post("http://localhost:5000/api/notes", { title, content }, { withCredentials: true });
    window.location.reload();
  }

  return (
    <div className="p-4">
      <h1>Your Notes</h1>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" />
      <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Content" />
      <button onClick={addNote}>Add Note</button>

      <ul>
        {notes.map(note => (
          <li key={note.id}>{note.title}: {note.content}</li>
        ))}
      </ul>
    </div>
  );
}
