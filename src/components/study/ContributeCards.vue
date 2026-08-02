<template>
  <section class="section rs" style="background: var(--bg2)">
    <div class="container">
      <div style="align-items: stretch" class="sc-contrib-grid grid-2">
        <div
          class="card-base"
          style="
            padding: 2.5rem;
            display: flex;
            flex-direction: column;
            border-color: rgba(212, 160, 23, 0.2);
          ">
          <div style="font-size: 2rem; margin-bottom: 1rem">📤</div>
          <div
            class="section-tag"
            style="margin-bottom: 1rem; align-self: flex-start">
            Student Contribution
          </div>
          <h3
            style="
              font-family: Cinzel, serif;
              font-weight: 700;
              font-size: 1.4rem;
              margin-bottom: 0.5rem;
            ">
            Share Your Notes
          </h3>
          <p
            style="
              color: var(--text2);
              font-size: 0.9rem;
              margin-bottom: 1.25rem;
            ">
            <strong style="color: var(--text)">Purpose:</strong>
            Community-driven academic content
          </p>
          <ul
            style="
              list-style: none;
              padding: 0;
              margin: 0 0 1.75rem;
              display: flex;
              flex-direction: column;
              gap: 0.6rem;
            ">
            <li
              style="
                display: flex;
                align-items: center;
                gap: 0.6rem;
                font-size: 0.88rem;
                color: var(--text2);
              ">
              <span style="color: var(--accent); font-size: 0.9rem">✦</span
              >Upload notes & resources
            </li>
            <li
              style="
                display: flex;
                align-items: center;
                gap: 0.6rem;
                font-size: 0.88rem;
                color: var(--text2);
              ">
              <span style="color: var(--accent); font-size: 0.9rem">✦</span
              >Help juniors & peers
            </li>
            <li
              style="
                display: flex;
                align-items: center;
                gap: 0.6rem;
                font-size: 0.88rem;
                color: var(--text2);
              ">
              <span style="color: var(--accent); font-size: 0.9rem">✦</span
              >WebOps review ensures quality
            </li>
          </ul>
          <a
            href="https://forms.gle/c86b55AZ517Q8Ahg6"
            target="_blank"
            rel="noopener noreferrer"
            class="submit-btn"
            style="align-self: flex-start; text-decoration: none"
            >Submit a Resource</a
          >
        </div>

        <div
          class="card-base"
          style="
            padding: 2.5rem;
            display: flex;
            flex-direction: column;
            border-color: rgba(212, 160, 23, 0.2);
          ">
          <div style="font-size: 2rem; margin-bottom: 1rem">🎯</div>
          <div
            class="section-tag"
            style="margin-bottom: 1rem; align-self: flex-start">
            Resource Request
          </div>
          <h3
            style="
              font-family: Cinzel, serif;
              font-weight: 700;
              font-size: 1.4rem;
              margin-bottom: 0.5rem;
            ">
            Request a Resource
          </h3>
          <p
            style="
              color: var(--text2);
              font-size: 0.9rem;
              margin-bottom: 1.25rem;
            ">
            <strong style="color: var(--text)">Purpose:</strong>
            Identify missing academic needs
          </p>
          <ul
            style="
              list-style: none;
              padding: 0;
              margin: 0 0 1.75rem;
              display: flex;
              flex-direction: column;
              gap: 0.6rem;
            ">
            <li
              style="
                display: flex;
                align-items: center;
                gap: 0.6rem;
                font-size: 0.88rem;
                color: var(--text2);
              ">
              <span style="color: var(--accent); font-size: 0.9rem">✦</span
              >Request missing topics
            </li>
            <li
              style="
                display: flex;
                align-items: center;
                gap: 0.6rem;
                font-size: 0.88rem;
                color: var(--text2);
              ">
              <span style="color: var(--accent); font-size: 0.9rem">✦</span
              >Exam-focused content
            </li>
            <li
              style="
                display: flex;
                align-items: center;
                gap: 0.6rem;
                font-size: 0.88rem;
                color: var(--text2);
              ">
              <span style="color: var(--accent); font-size: 0.9rem">✦</span
              >Helps WebOps prioritize
            </li>
          </ul>
          <a
            href="https://forms.gle/KNm4hyupaG22Huxd6"
            target="_blank"
            rel="noopener noreferrer"
            class="submit-btn"
            style="
              align-self: flex-start;
              background: transparent;
              border: 1px solid var(--accent);
              color: var(--accent);
              text-decoration: none;
            "
            >Request a Resource</a
          >
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@media (max-width: 768px) {
  .sc-contrib-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
