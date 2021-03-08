import React, { forwardRef } from 'react';
import { createBrowserHistory } from 'history';
import moment from 'moment-timezone';

import Bear from './static/avatars/bear.png';
import Cat from './static/avatars/cat.png';
import Deer from './static/avatars/deer.png';
import Dog from './static/avatars/dog.png';
import Fox from './static/avatars/fox.png';
import Giraffe from './static/avatars/giraffe.png';
import Gorilla from './static/avatars/gorilla.png';
import Koala from './static/avatars/koala.png';
import Llama from './static/avatars/llama.png';
import Panda from './static/avatars/panda.png';
import Pug from './static/avatars/pug.png';
import Rabbit from './static/avatars/rabbit.png';
import Raccoon from './static/avatars/raccoon.png';
import Reindeer from './static/avatars/reindeer.png';
import Skunk from './static/avatars/skunk.png';
import Wolf from './static/avatars/wolf.png';
import Lion from './static/avatars/lion.jpg';
import Weasel from './static/avatars/weasel.jpg';
import Monkey from './static/avatars/monkey.jpg';
import Pig from './static/avatars/pig.jpg';

import { 
  AddBox,
  Check,
  Clear,
  DeleteOutline,
  ChevronLeft,
  ChevronRight,
  Edit,
  SaveAlt,
  FilterList,
  FirstPage,
  LastPage,
  Search,
  ArrowDownward,
  Remove,
  ViewColumn,
} from '@material-ui/icons';

export const history = createBrowserHistory({forceRefresh: true});

export const timeZoneNames = moment.tz.names().filter(tz => tz !== 'Asia/Qostanay').map(tz => tz.replace('_', ' ')); // TODO Asia/Qostanay isn't in pytz timezones

export const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};

export const gradeMappings = new Map([
  [-1, '未就学'],
  [0, '幼稚園'],
  [1, '小１'],
  [2, '小２'],
  [3, '小３'],
  [4, '小４'],
  [5, '小５'],
  [6, '小６'],
  [7, '中１'],
  [8, '中２'],
  [9, '中３'],
  [10, '高１'],
  [11, '高２'],
  [12, '高３'],
  [13, '高４'],
]);

export const avatarMapping = new Map([
  ['bear', Bear],
  ['cat', Cat],
  ['deer', Deer],
  ['dog', Dog],
  ['fox', Fox],
  ['giraffe', Giraffe],
  ['gorilla', Gorilla],
  ['koala', Koala],
  ['llama', Llama],
  ['panda', Panda],
  ['pug', Pug],
  ['rabbit', Rabbit],
  ['raccoon', Raccoon],
  ['reindeer', Reindeer],
  ['skunk', Skunk],
  ['wolf', Wolf],
  ['lion', Lion],
  ['weasel', Weasel],
  ['monkey', Monkey],
  ['pig', Pig],
]);

// TODO redirect to login if no token
export function getUserIdFromToken() {
  const token = localStorage.getItem('refresh_token');
  const encodedPayLoad = token.split('.')[1];
  const payloadObject = JSON.parse(atob(encodedPayLoad));
  const userId = payloadObject.user_id;
  return userId;
}

function getUserTypeFromToken() {
  const token = localStorage.getItem('refresh_token');
  const encodedPayLoad = token.split('.')[1];
  const payloadObject = JSON.parse(atob(encodedPayLoad));
  const userType = payloadObject.user_type;
  return userType;
}

export function isTeacher() {
  return getUserTypeFromToken() === 'TEACHER';
}

export function isStudent() {
  return getUserTypeFromToken() === 'STUDENT';
}

export function isAdmin() {
  return getUserTypeFromToken() === 'ADMIN';
}

export class AccountRegistrationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AccountRegistrationError';
  }
}

export class CardError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CardError';
  }
}

export class SetupIntentError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SetupIntentError';
  }
}

// export function getDateFromISODateTime(dateTime) {
//  return dateTime.slice(0, 10);
// }

// export function getTimeFromISODateTime(dateTime) {
//  return dateTime.slice(11);
// }

export const userAgreement = [
'第 1 条（目的）',
'- このサクセス・アカデミー利用規約（以下「本規約」という）は、「サクセス・アカデミー」（以下「本会」という）の会員（以下「会員」という）が、合同会社MERCY（以下「当社」という）の運営するオンライン塾「サクセス・アカデミー」（以下「本サービス」という）を利用するに際して、その規則を定めたものとなります。',
'- 本規約は、本文および別紙により構成され、会員が本サービスを利用する場合の一切の事項に適用されます。',
'第２条（本規約の追加・変更）',
'- 本規約は、当社の裁量により、会員の了承を得ることなく追加、変更される場合があります。',
'- 本規約の追加、変更は、特に適用開始時期を定めない限り、当社が自己のホームページに当該追加、変更を表示した時をもって効力を生じるものとし、以後、追加、変更後の規約が本規約に優先して適用されることとします。',
'第３条（会員）',
'- 会員となろうとする者（以下「入会希望者」という）は、本規約の内容を承諾の上、本会への入会を申し込むものとします。',
'- 当社は、希望コースについて入会申し込みを受け付けた後、必要な審査、手続きを経て入会を承認します。なお、入会申し込みがあった場合でも、当社の審査において、会員とすることに支障があると判断された場合には、入会を承認しない場合があります。',
'- 当社は、申し込み時、入会希望者へ対して料金の請求を行います。入会希望者は、料金を当社の指定する方法により支払うものとします。',
'- 入会希望者が所定の費用について入金をした時点で、入会希望者は、会員となるものとします。但し、支払い時期について別途合意がある場合は入金を待たず、会員とする場合があります。',
'- 本会の会員へ対する重要なお知らせは、当社より電子メールにて通知します。塾生は、本会への入会と同時に、当該電子メールを受け取ることに予め承諾するものとします。',
'第４条（本サービスの内容）',
'- 本サービス及び費用の内容は、別紙に定めるとおりとする。',
'第５条（本規約の遵守等）',
'- 会員は、本規約を遵守し、当社の指示に従って本サービスを利用するものとします。',
'第６条（知的財産権の帰属）',
'- 本サービスの提供にあたり、当社が作成し、会員に提出するドキュメント等に対する著作権、およびそれらに含まれるノウハウ、コンセプト、アイディアその他の知的財産権は、すべて当社に帰属します。',
'- 会員は、当社が提供する指導・セミナーや講演会において、その映像・音声を、当社の承諾なく、これを撮影・録音してはならないものとします。',
'第７条（知的財産権等の尊重）',
'- 会員は、本サービスを通じて入手する情報について、著作権法、特許法その他の知的財産法を遵守するものとします。なお会員は、これらの情報について開示範囲を合理的に限定するなど、その漏洩防止義務を負うものとします。',
'第８条（本サービスの中断）',
'- 当社は、次の各号のいずれかの事態が生じた場合、会員に事前に通知することなく、一時的に本サービスの全部または一部を中断することがあります。',
'- 停電、火災等、社会インフラの障害により本サービスが提供できない場合',
'- 天災、戦争、暴動等の不可抗力で本サービスの提供ができない場合',
'- 法令に基づく措置により本サービスが提供できない場合',
'- 講演者の健康上の理由によりサービスが提供できない場合',
'- その他、運営上、技術上の理由により本サービスの中断が必要であると当社が判断した場合',
'- 前項各号に基づき本サービスの中断がなされた場合、当社は、これに起因して生じた会員の損害につき一切の責任を負わないものとします。',
'第９条（本サービスの中止）',
'- 当社は、事前に告知することにより、本サービスの全部または一部の提供を中止できるものとします。',
'- 前項に基づきサービスの中止がなされた場合、当社は、これに起因して生じた会員の損害につき一切の責任を負わないものとします。',
'第１０条（変更の届け出）',
'- 本会員は、E メールアドレス、住所、電話番号、その他当社の定めた手続きの過程で当社に届け出た内容に変更が生じた場合には、すみやかに変更内容を当社に届け出るものとします。',
'- 会員が前項の届け出をなすまでの間、または届け出を怠ったことにより、会員が被った不利益については、当社は一切責任を負いません。',
'第１１条（退 会）',
'- 会員が各コースのサービス期間の終了を待たずに利用を終了する場合には、当社に対して本サービスからの退会届けを提出するものとし、当該退会届けを当社が受領したときをもって、会員は、本サービスから退会したものとします。なお、会員が退会した場合でも、当社が既に受領した入塾金、その他の金銭債務の払戻等はなされません。',
'- 但し、やむを得ない事由による退会と当社が認めた場合、請求金額から受講済みの回を按分して控除した残額から、さらに解約事務手数料として＄１００を控除した残金について払戻を行う場合があります。',
'-退会申請は毎月20日までに行えばその月末退会とします。20日を過ぎると翌月分も決済され翌月末の退会となります。会費は入会時日割りを適用し、退会時の日割り適用はありません。',
'- 会員が死亡した場合には、死亡時に本サービスの会員資格を失うものとします。',
'第１２条（会員の責任）',
'- 会員が、他の会員、その他の第三者から要求、クレーム等を受け、または他の会員、その他の第三者に対して要求、クレーム等を受けた場合には、会員は、自己の責任の負担で、これらの要求、クレーム等、およびこれに起因する紛争を処理解決するものとし、当社に一切迷惑または損害を与えないものとします。',
'- 会員は、前各項、その他本サービスの利用に関連して当社に損害を与えた場合、当該損害を賠償するものとします。',
'- 会員が未成年の場合、保護者が会員に代わり責を負うものとします。',
'第１３条（免責）',
'- 会員は、本サービスが当社の善良な見解に基づいて遂行されることを認識し、その採否の全てを自己の責任において行うものとします。',
'- 会員は、本サービスが、会員の成績の数値向上、会員の課題の解決など会員における定数、定量、定性的な成果の獲得を必ずしも約束または保証するものではないことを確認します。',
'- 当社は、本規約に明示的に定める場合の他、会員が本サービスの利用に関連して被った損害、本サービスを利用できなかったことに起因する損害に関し、いかなる責任も負わないものとします。',
'第１４条（個人情報の保護）',
'- 個人情報（「個人情報の保護に関する法律」（平成 15 年５月 30 日法律第 57 号）第２条第１項に定める「個人情報」をいいます。以下同じ）に関するお問い合わせは以下のとおりとします。',
'- 合同会社MERCY (MERCY EDUCATION) ',
'- 〒243-0122神奈川県厚木市森の里4-12-128',
'- 当社は会員の個人情報につき、以下の目的の範囲内で、適切に取り扱うものとします。',
'- 会員の申込・契約締結・会費徴収手続き・退会手続きのため',
'- 当社の別紙に定めるサービスの提供及び情報提供のため',
'- 当社の販売する事業及び商品を会員に紹介するため',
'- 当社の社員が会員を訪問するため',
'- 当社のサービス向上及び事業開発の目的によるアンケート調査及びその分析のため',
'- 会員の退会後についても、個人情報を法令に従って取り扱い、保有する必要がなくなったものについて',
'は、速やかにこれを消去するものとします。',
'第１５条（当社の委託先に対する個人情報の提供）',
'- 前条に定めるほか、当社は、本サービスの遂行を当社の委託先（以下「委託先」という）に委託する場合は、委託先に会員の個人情報を当社の責任において提供することができるものとします',
'- 前項に基づき当社が委託先に会員の個人情報を開示する場合、当社は、当該委託先に、本規約と同等の個人情報保護の義務を負わせるものとします。',
'第１６条（管轄裁判所）',
'- 会員と当社の間の訴訟については、横浜地方裁判所または厚木簡易裁判所を第一審の専属的合意管轄裁判所とします。',
'第１７条（準拠法）',
'- 本規約に関する準拠法は日本法とします。',
'',
'【別紙 1 】サービス内容について',
'本規約第５条の定める本サービス及び費用とは、以下の内容とする。',
'なお、費用についてはそれぞれ別途割引制度などの適用により、実際の請求金額とは異なる場合がある。',
'・会費',
'$30（税込）',
'・ミニマムコース',
'会費を納入している会員はフリーレッスンを受けることができる。',
'対象：4才～中学生。ただし子ども能力により相談に応じます。',
'スケジュールと内容はオプションを含めHPに公開されているものを参照。',
'・ミニマムコースのオプション',
'①	未就学児クラス（追加＄10）10人限定。　②土日クラス（追加$10）',
'・スタンダードコース',
'２～３人のグループレッスンを追加。1コマ25分。',
'月額：週1コマ(月4コマ)$80～。',
'・プレミアムコース',
'1:1の個別指導を追加。1コマ25分。',
'月額：週1コマ(月4コマ)＄100～',
'・入会費：$100',
'紹介により入会する場合は無料。紹介者を確認できる番号等が必要。',
'・上記金額は変更のない限り毎月自動更新とし、変更時は事前告知をし、特にお申し出がなければ新料金へ自動変更いたします。',
'',
'【付則】塾生に関する規定',
'１．指導開始直前（2分程度前）に、Zoomにつなぎ指定されたIDのクラスに入っておくこと。',
'２．個別指導で遅刻・欠席をする場合は、事前に必ず連絡すること。無料サポートも連絡願います。',
'３．指導中は、テレビやゲーム、スマホをOFFにし、勉強に集中すること。',
'ご家族も協力をお願いします。',
'４．指導中に飲食をしないこと。指導時間までに飲食はすませ、レッスンに集中すること。',
'５．グループレッスンの場合は、他の生徒の妨げになると思われる時はマイクを強制消音致します。',
'６．著しく参加態度の悪い生徒、他の迷惑になる生徒は強制退出いただくことがあります。',
'',
'サクセス・アカデミー',
'運営：MERCY EDUCATION',
'合同会社MERCY',
'info@mercy-education.com',
'',
'2020.03制定',
'2020.08改訂'];

export const referralMessage = [
'★会員向けフリーレッスンをすぐに体験する！',
'※会員登録時に紹介コードを入力すると、体験後の入会費$100が免除されます',
'.',
'★会員向けフリーレッスンの特徴',
'・クラスは週５日ご用意してます',
'・お子様のレベルに合ったクラスを何度でも取り放題',
'・ご自由に参加退出できます',
'・他の国・地域に住むお友達と交流する機会もあります♪',
'.',
'会員登録するとすぐに体験できますので、まずはお試しください！',
'（会員登録後30日は無料トライアルです。継続の場合は30日後に決済が始まります。）',
'.',
'また、会員向けフリーレッスンに加えて個別（グループ）レッスンもご用意しております。',
'ご希望であれば個別（グループ）レッスンの体験も2回まで無料でしていただけますのでお気軽にお申し付けください。',
'info@mercy-education.com',

'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
'【会員登録手順】',
'.',
'会員登録は下記のページより、お願いします。',
'https://yoyakusite.herokuapp.com/',
'（お子様1人一つずつ、アカウント登録ください。ユーザーIDとパスワードは自由に設定できます。半角英数7文字以上）',
'.',
'☆★会員登録後30日は無料トライアルです。継続の場合は30日後に決済が始まります。★☆',
'.',
'以下、会員向けフリーレッスンについての詳細です。',
'➡️新しいプラン「ミニマムコース」の説明',
'http://mercy-education.com/FREE/cn2/2020-07-14-3.html',
'➡️お支払の方法について',
'http://mercy-education.com/FREE/cn2/2020-08-18.html',
'➡️入会についてFAQ',
'http://mercy-education.com/FREE/cn2/2020-08-28-2.html'];