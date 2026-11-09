// web3forms.com에서 발급받은 액세스 키 (브라우저에 공개되는 값입니다)
const ACCESS_KEY = '6b24958b-30a2-41c0-b965-b4adf8ee7b49';

const $ = (id) => document.getElementById(id);
const chipsIn = (id) => [...$(id).querySelectorAll('.chip')];
const selected = (id) => chipsIn(id).filter((c) => c.classList.contains('on')).map((c) => c.textContent);

function setChip(chip, on) {
  chip.classList.toggle('on', on);
  chip.setAttribute('aria-pressed', on);
}

// 모바일 메뉴
function setMenu(open) {
  $('menu').hidden = !open;
  $('menu-open').setAttribute('aria-expanded', open);
}
$('menu-open').addEventListener('click', () => setMenu(true));
$('menu-close').addEventListener('click', () => setMenu(false));
$('menu').querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

// 무드 · 기능 (복수 선택)
['moods', 'feats'].forEach((id) => {
  chipsIn(id).forEach((chip) => {
    chip.addEventListener('click', () => setChip(chip, !chip.classList.contains('on')));
  });
});

// 패키지 (단일 선택, 가격 카드와 연동)
const plans = [...document.querySelectorAll('.plan')];
let pkg = '';

function setPkg(value, fromPlan) {
  pkg = value;
  chipsIn('pkgs').forEach((c) => setChip(c, c.textContent === value));
  const anyPlan = plans.some((p) => p.dataset.plan === value);
  plans.forEach((p) => {
    const sel = p.dataset.plan === value;
    const btn = p.querySelector('button');
    p.classList.toggle('hi', anyPlan ? sel : p.dataset.plan === 'Standard');
    btn.className = sel ? 'btn btn-p' : 'btn btn-g';
    btn.textContent = sel ? '선택됨 — 의뢰서 작성하기' : '이 패키지로 의뢰하기';
    btn.setAttribute('aria-pressed', sel);
  });
  $('pkg-hint').hidden = !(fromPlan && anyPlan);
}

chipsIn('pkgs').forEach((chip) => {
  chip.addEventListener('click', () => setPkg(pkg === chip.textContent ? '' : chip.textContent, false));
});
plans.forEach((p) => {
  p.querySelector('button').addEventListener('click', () => {
    setPkg(p.dataset.plan, true);
    $('apply').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// 의뢰서 검증
const form = $('apply-form');
let tried = false;

function validate() {
  const nameOk = $('f-name').value.trim().length > 0;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($('f-email').value.trim());
  const consentOk = $('f-consent').checked;
  const transferOk = $('f-transfer').checked;
  $('f-name').classList.toggle('err', !nameOk);
  $('f-email').classList.toggle('err', !emailOk);
  $('err-name').hidden = nameOk;
  $('err-email').hidden = emailOk;
  $('err-consent').hidden = consentOk;
  $('err-transfer').hidden = transferOk;
  return nameOk && emailOk && consentOk && transferOk;
}

form.addEventListener('input', () => {
  if (tried) validate();
});

// 의뢰서 전송
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  tried = true;
  if (!validate()) return;

  const btn = $('submit-btn');
  const name = $('f-name').value.trim();
  const email = $('f-email').value.trim();

  btn.disabled = true;
  btn.textContent = '보내는 중…';
  $('err-send').hidden = true;

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: ACCESS_KEY,
        botcheck: $('f-botcheck').checked,
        subject: `[한's 스튜디오] 새 의뢰서 — ${name}`,
        from_name: "한's 스튜디오 홈페이지",
        email, // 받은 메일에서 답장하면 의뢰인에게 갑니다.
        '이름': name,
        '회사 / 브랜드명': $('f-company').value.trim(),
        '연락처': $('f-phone').value.trim(),
        '가치관': $('f-values').value.trim(),
        '브랜드 무드': selected('moods').join(', '),
        '필요한 기능': selected('feats').join(', '),
        '원하는 기능 설명': $('f-func').value.trim(),
        '패키지': pkg,
        '기타 요청사항': $('f-extra').value.trim(),
      }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    $('thanks').textContent = `${name}님, 감사합니다. ${email}로 영업일 기준으로 빠르게 연락드릴게요.`;
    form.hidden = true;
    $('sent').hidden = false;
  } catch (err) {
    console.error(err);
    $('err-send').hidden = false;
  } finally {
    btn.disabled = false;
    btn.textContent = '의뢰서 보내기';
  }
});

// 새 의뢰서
$('reset-btn').addEventListener('click', () => {
  form.reset();
  ['moods', 'feats'].forEach((id) => chipsIn(id).forEach((c) => setChip(c, false)));
  setPkg('', false);
  tried = false;
  ['f-name', 'f-email'].forEach((id) => $(id).classList.remove('err'));
  ['err-name', 'err-email', 'err-consent', 'err-transfer', 'err-send'].forEach((id) => { $(id).hidden = true; });
  $('sent').hidden = true;
  form.hidden = false;
});
