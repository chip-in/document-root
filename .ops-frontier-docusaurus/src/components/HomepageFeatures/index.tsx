import type {ReactNode} from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type FeatureItem = {
    title: string
    Svg: string
    description: ReactNode
}

const FeatureList: FeatureItem[] = [
    {
        title: "DevSecOps",
        Svg: require("@site/static/img/devsecops.svg").default,
        description: (
            <>
                Ops Frontier は、DevSecOps を実践するための ベストプラクティス
                を提供し、組織のセキュリティレベル向上と開発スピード向上に貢献します。
            </>
        ),
    },
    {
        title: "Zero Trust Architecture",
        Svg: require("@site/static/img/zerotrust.svg").default,
        description: (
            <>
                従来の境界型セキュリティでは、社内ネットワークに侵入されると、内部のシステムやデータは脅威に晒されていました。
                Ops Frontierは、ゼロトラストアーキテクチャ を採用し、全てのアクセスを検証
                することで、社内外を問わず、あらゆる脅威からシステムを保護 します。
            </>
        ),
    },
    {
        title: "オールインワン",
        Svg: require("@site/static/img/allinone.svg").default,
        description: <>Ops Frontierは、DevSecOpsの実践に必要な機能を オールインワン で提供するプラットフォームです。</>,
    },
]

function Feature({title, Svg, description}: FeatureItem) {
  return (
      <div className={clsx("col col--4")}>
          <div className="text--center">
              <Svg className={styles.featureSvg} role="img" />
          </div>
          <div className="text--center padding-horiz--md">
              <h3>{title}</h3>
              <p>{description}</p>
          </div>
      </div>
  )
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
