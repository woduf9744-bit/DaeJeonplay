import { BarChart, Bar, BarXAxis, Grid, ChartTooltip } from "@/components/ui/bar-chart";
import { RingChart, Ring, RingCenter } from "@/components/ui/ring-chart";
import { CATEGORIES, type Category, getPartial, getLevel } from "../lib/game";

// Both charts are actual Bklit UI registry components.
// Install their sources once: `npm run setup:charts` (after `npm install`).
export default function GrowthCharts({ totals }: { totals: Record<Category, number> }) {
  const rows = (Object.keys(CATEGORIES) as Category[]).map((key) => ({
    label: CATEGORIES[key].name,
    value: getPartial(totals[key]),
    maxValue: 100,
    color: CATEGORIES[key].color,
    total: totals[key],
    lv: getLevel(totals[key]),
  }));
  const barData = rows.map((row) => ({ name: row.label, xp: row.total }));
  return (
    <div className="chart-layout">
      <section className="chart-panel ring-panel" aria-label="분야별 다음 레벨 진행률">
        <div className="chart-heading"><span>LEVEL PROGRESS</span><h3>다음 레벨까지</h3><p>링 하나가 탐험 분야 하나를 뜻해요.</p></div>
        <div className="ring-wrap">
          <RingChart data={rows} size={255} strokeWidth={11} ringGap={7} baseInnerRadius={38}>
            {rows.map((row, index) => <Ring key={row.label} index={index} color={row.color} />)}
            <RingCenter defaultLabel="5개 성장 분야" />
          </RingChart>
        </div>
        <div className="chart-legend">
          {rows.map((row) => <div className="legend-row" key={row.label}><span className="legend-bullet" style={{ background: row.color }} /> <span>{row.label} Lv.{row.lv}</span><strong>{row.value}/100</strong></div>)}
        </div>
      </section>
      <section className="chart-panel bar-panel" aria-label="분야별 누적 경험치 그래프">
        <div className="chart-heading"><span>XP OVERVIEW</span><h3>내 탐험의 발자국</h3><p>완료한 퀘스트에서 얻은 분야별 누적 XP입니다.</p></div>
        <div className="bar-wrap">
          <BarChart data={barData} xDataKey="name" animationDuration={1100} aspectRatio="1.7 / 1" margin={{ top: 26, right: 20, bottom: 30, left: 10 }}>
            <Grid horizontal />
            <Bar dataKey="xp" fill="var(--chart-line-primary)" lineCap="round" showValue valueLabelFormatter={(value) => `${value}`} />
            <BarXAxis />
            <ChartTooltip />
          </BarChart>
        </div>
        <div className="chart-footnote">미션은 체험 모드에서 완료할 수 있어요. 실제 현장 인증은 추후 연결 예정.</div>
      </section>
    </div>
  );
}
