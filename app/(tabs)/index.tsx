import React, { useEffect, useState } from 'react';
import { Alert, Button, Image, ImageBackground, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Candidate = { id: 'c1' | 'c2'; name: string; img: any; accent: string };

const candidates: Candidate[] = [
  {
    id: 'c1',
    name: 'CALON 1: ARYA DWI NUGRAHA',
    img: require('@/assets/images/sholeh.jpg'),
    accent: '#3B82F6',
  },
  {
    id: 'c2',
    name: 'CALON 2: RIFQI BANTEEKA',
    img: require('@/assets/images/bambang.jpg'),
    accent: '#F97316',
  },
];

// helper konfirmasi cross-platform
function confirmAsync(message: string): Promise<boolean> {
  if (Platform.OS === 'web') return Promise.resolve(window.confirm(message));
  return new Promise((resolve) => {
    Alert.alert(
      'Konfirmasi',
      message,
      [
        { text: 'Batal', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Kirim', onPress: () => resolve(true) },
      ],
      { cancelable: true }
    );
  });
}

export default function App() {
  const [voter, setVoter] = useState({ nama: '', nim: '', fakultas: '', prodi: '' });
  const [selectedId, setSelectedId] = useState<Candidate['id'] | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votes, setVotes] = useState<Record<'c1' | 'c2', number>>({ c1: 0, c2: 0 });

  // Timer (tampilan saja)
  const [seconds, setSeconds] = useState(80);
  useEffect(() => setSeconds(80), []);
  useEffect(() => {
    if (hasVoted || seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, hasVoted]);

  const onChange = (k: keyof typeof voter, v: string) => setVoter((x) => ({ ...x, [k]: v }));

  const isFormFilled = !!voter.nama.trim() && !!voter.nim.trim() && !!voter.fakultas.trim() && !!voter.prodi.trim() && !!selectedId;

  const handleSubmit = async () => {
    if (hasVoted) {
      if (Platform.OS === 'web') window.alert('Kamu sudah mengirim pilihan.');
      else Alert.alert('Info', 'Kamu sudah mengirim pilihan.');
      return;
    }
    if (!isFormFilled) {
      if (Platform.OS === 'web') window.alert('Isi semua kolom dan pilih salah satu calon.');
      else Alert.alert('Lengkapi dulu', 'Isi semua kolom dan pilih salah satu calon.');
      return;
    }

    const calon = candidates.find((c) => c.id === selectedId)!;
    const ok = await confirmAsync(`Kirim pilihan untuk ${calon.name}?`);
    if (!ok) return;

    setVotes((p) => ({ ...p, [calon.id]: p[calon.id] + 1 }));
    setHasVoted(true);

    const thanks = `Pilihan atas nama ${voter.nama} (${voter.nim}) tersimpan.`;
    if (Platform.OS === 'web') window.alert(`Terima kasih!\n${thanks}`);
    else Alert.alert('Terima kasih!', thanks);
  };

  const reset = () => {
    setVoter({ nama: '', nim: '', fakultas: '', prodi: '' });
    setSelectedId(null);
    setHasVoted(false);
    setSeconds(80);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground
        source={require('@/assets/images/LogoHMIF.jpg')} // ganti ke path relatif jika alias '@/' belum ada
        style={styles.bg}
        resizeMode="center" // logo di tengah
        imageStyle={{ opacity: 0.18 }} // lebih terlihat tapi tetap soft
      >
        <ScrollView contentContainerStyle={[styles.wrap, { paddingBottom: 120 }]}>
          {/* Header */}
          <View style={styles.banner}>
            <View style={styles.bannerBadge}>
              <Text style={styles.bannerBadgeText}>🗳️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.bannerTitle, { textAlign: 'center' }]}>PEMILIHAN KETUA HIMPUNAN</Text>
              <Text style={[styles.bannerSub, { textAlign: 'center' }]}>Fakultas Sains dan Matematika</Text>
              <Text style={[styles.bannerSub, { textAlign: 'center' }]}>Program Studi Informatika 2025/2026</Text>
            </View>
            <View style={styles.timerPill}>
              <Text style={styles.timerText}>Sisa Waktu {String(seconds).padStart(2, '0')}s</Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <LabeledInput label="Nama" value={voter.nama} onChangeText={(t) => onChange('nama', t)} editable={!hasVoted} />
            <LabeledInput label="NIM" keyboardType="number-pad" value={voter.nim} onChangeText={(t) => onChange('nim', t)} editable={!hasVoted} />
            <LabeledInput label="Fakultas" value={voter.fakultas} onChangeText={(t) => onChange('fakultas', t)} editable={!hasVoted} />
            <LabeledInput label="Prodi" value={voter.prodi} onChangeText={(t) => onChange('prodi', t)} editable={!hasVoted} />
          </View>

          {/* Calon */}
          <Text style={styles.sectionTitle}>Pilih Calon Favoritmu!</Text>
          <View style={styles.grid}>
            {candidates.map((c) => {
              const active = selectedId === c.id;
              return (
                <TouchableOpacity key={c.id} activeOpacity={0.9} onPress={() => !hasVoted && setSelectedId(c.id)} style={[styles.card, { borderColor: active ? c.accent : '#E5E7EB', shadowColor: c.accent }]}>
                  <View style={styles.photoBox}>
                    <Image source={c.img} style={styles.photo} resizeMode="contain" />
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.candidateName}>{c.name}</Text>
                    <View style={styles.ringRow}>
                      <View style={[styles.ring, { borderColor: c.accent }]}>{active && <View style={[styles.ringDot, { backgroundColor: c.accent }]} />}</View>
                      <Text style={styles.ringHint}>{active ? 'Dipilih' : 'Pilih'}</Text>
                    </View>
                    {hasVoted && <Text style={styles.voteCount}>Suara: {votes[c.id]}</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Submit & Reset */}
          <View style={styles.submitArea}>
            <TouchableOpacity activeOpacity={0.9} onPress={handleSubmit} style={[styles.submitBtn, isFormFilled && !hasVoted ? styles.btnPrimary : styles.btnDisabled]}>
              <Text style={styles.submitText}>{hasVoted ? 'SUDAH MEMILIH' : isFormFilled ? 'SUBMIT PILIHAN' : 'LENGKAPI DATA DIRI & PILIH CALON'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetBtn} onPress={reset} activeOpacity={0.85}>
              <Text style={styles.resetText}>RESET FORMULIR</Text>
            </TouchableOpacity>

            {/* Debug kecil – boleh hapus 
            <Text style={{ textAlign: 'center', color: '#6B7280', marginTop: 4, fontSize: 12 }}>
              debug → filled:{String(isFormFilled)} | selected:{String(selectedId)} | nama:{voter.nama.length} nim:{voter.nim.length}
            </Text> */}

            {/* Button dummy supaya komponen Button tetap ada */}
            <View style={{ height: 0, overflow: 'hidden' }}>
              <Button title="dummy" onPress={() => {}} />
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

/* --- Input kecil --- */
function LabeledInput(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  const { label, style, ...rest } = props;
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput {...rest} style={[styles.input, style]} placeholderTextColor="#9CA3AF" />
    </View>
  );
}

/* --- Styles --- */
const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#F2F6FF', // warna dasar
  },
  // penting: transparan agar background logo terlihat
  wrap: { padding: 16, gap: 16, backgroundColor: 'transparent' },

  banner: {
    backgroundColor: '#10243E',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1F3B66',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerBadgeText: { fontSize: 22, color: 'white' },
  bannerTitle: { color: 'white', fontWeight: '800', letterSpacing: 0.5 },
  bannerSub: { color: '#C7D2FE', marginTop: 2, fontSize: 12 },
  timerPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#1E40AF' },
  timerText: { color: 'white', fontSize: 12, fontWeight: '700' },

  form: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  inputLabel: { fontWeight: '700', color: '#111827' },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#111827',
  },

  sectionTitle: { fontWeight: '700', fontSize: 16, color: '#111827', paddingHorizontal: 2 },

  grid: { flexDirection: 'row', gap: 12 },
  card: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 18,
    borderWidth: 2,
    overflow: 'hidden',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  photoBox: { width: '100%', aspectRatio: 3 / 4, backgroundColor: '#F3F4F6' },
  photo: { width: '100%', height: '100%' },
  cardBody: { padding: 12, gap: 10, alignItems: 'center' },
  candidateName: { textAlign: 'center', fontWeight: '700', color: '#111827' },

  ringRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ring: { width: 30, height: 30, borderRadius: 999, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  ringDot: { width: 16, height: 16, borderRadius: 999 },
  ringHint: { fontSize: 12, color: '#6B7280' },
  voteCount: { fontSize: 12, color: '#374151' },

  submitArea: { gap: 10, marginTop: 6 },
  submitBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnPrimary: { backgroundColor: '#2563EB' },
  btnDisabled: { backgroundColor: '#93C5FD' },
  submitText: { color: 'white', fontWeight: '800', letterSpacing: 0.3 },

  resetBtn: { backgroundColor: '#2F80ED', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  resetText: { color: 'white', fontWeight: '800', letterSpacing: 0.3 },
});
