import { useEffect, useRef, useState } from 'react';
import { FiCamera, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { faceService } from '../services/faceService';
import { PageHeader, Card, ProgressBar, Badge } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function FaceAttendance() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const loopRef = useRef(null);
  const { students, attendanceService, refresh } = useData();
  const { user } = useAuth();
  const { toast } = useToast();
  const [modelProgress, setModelProgress] = useState(0);
  const [modelsReady, setModelsReady] = useState(false);
  const [active, setActive] = useState(false);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const registeredCount = students.filter((s) => s.faceDescriptor).length;

  const loadModels = async () => {
    try {
      await faceService.loadModels(setModelProgress);
      setModelsReady(true);
      toast('Face models ready', 'success');
    } catch (err) {
      toast(err.message || 'Failed to load face models', 'error');
    }
  };

  useEffect(() => {
    loadModels();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    if (!modelsReady) await loadModels();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);
      setResult(null);
      loopRef.current = setInterval(scanOnce, 1800);
    } catch (err) {
      toast('Webcam permission denied or unavailable', 'error');
    }
  };

  const stopCamera = () => {
    if (loopRef.current) clearInterval(loopRef.current);
    loopRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
  };

  const scanOnce = async () => {
    if (!videoRef.current || busy || videoRef.current.readyState < 2) return;
    setBusy(true);
    try {
      const detection = await faceService.detectFromVideo(videoRef.current);
      if (!detection) {
        setResult({ matched: false, reason: 'No face in frame' });
        return;
      }
      const match = faceService.matchDescriptor(detection.descriptor);
      if (match.matched) {
        try {
          attendanceService.mark({
            studentId: match.student.id,
            status: 'present',
            method: 'face',
            markedBy: user?.email,
            confidence: match.confidence,
          });
          refresh();
          setResult({ ...match, verified: true });
          toast(`Face verified: ${match.student.name} (${match.confidence}%)`, 'success');
        } catch (err) {
          setResult({ ...match, verified: true, duplicate: true });
          toast(err.message, 'warning');
        }
      } else {
        setResult({ matched: false, reason: match.reason || 'Face not recognized', confidence: match.confidence });
      }
    } catch (err) {
      setResult({ matched: false, reason: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Face recognition attendance"
        subtitle="Live webcam matching against registered facial embeddings"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-2">
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center">
            <video ref={videoRef} muted playsInline className={`w-full h-full object-cover ${active ? '' : 'hidden'}`} />
            {!active && (
              <div className="text-center text-slate-300 p-6">
                <FiCamera size={40} className="mx-auto mb-3 opacity-60" />
                <p className="text-sm">Webcam preview will appear here</p>
              </div>
            )}
            {result && (
              <div className={`absolute bottom-4 left-4 right-4 rounded-2xl px-4 py-3 text-sm backdrop-blur-md border ${
                result.matched || result.verified ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-50' : 'bg-rose-500/20 border-rose-400/40 text-rose-50'
              }`}>
                {result.matched || result.verified ? (
                  <p className="flex items-center gap-2 font-medium">
                    <FiCheckCircle /> Face Verified — {result.student?.name} · {result.confidence}%
                    {result.duplicate && ' (already marked today)'}
                  </p>
                ) : (
                  <p className="flex items-center gap-2 font-medium">
                    <FiXCircle /> Face Not Recognized {result.confidence != null ? `· ${result.confidence}%` : ''} — {result.reason}
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {!active ? (
              <Button onClick={startCamera} disabled={!modelsReady && modelProgress > 0 && modelProgress < 100}>
                Start live attendance
              </Button>
            ) : (
              <>
                <Button variant="secondary" onClick={scanOnce} loading={busy}>Scan now</Button>
                <Button variant="danger" onClick={stopCamera}>Stop camera</Button>
              </>
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5 space-y-3">
            <h3 className="font-display font-semibold">Model status</h3>
            {!modelsReady ? (
              <ProgressBar value={modelProgress} label="Loading face-api models" />
            ) : (
              <Badge tone="success">Models ready</Badge>
            )}
            <p className="text-sm text-[var(--text-muted)]">
              {registeredCount} student{registeredCount === 1 ? '' : 's'} with registered faces
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Register faces from a student profile before starting a session. Matching uses Euclidean distance on face descriptors with confidence scoring.
            </p>
          </Card>

          <Card className="p-5">
            <h3 className="font-display font-semibold mb-3">Registered faces</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {students.filter((s) => s.faceDescriptor).map((s) => (
                <div key={s.id} className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 overflow-hidden flex items-center justify-center text-primary text-xs font-semibold">
                    {s.photo ? <img src={s.photo} alt="" className="h-full w-full object-cover" /> : s.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{s.rollNo}</p>
                  </div>
                </div>
              ))}
              {registeredCount === 0 && (
                <p className="text-sm text-[var(--text-muted)]">No faces registered yet. Open a student profile and click Register Face.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
