<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Public booking architecture
- Keep centralized browser-safe pricing and content modules separate from visual sections so factual rules remain testable.
- Booking and investment forms compose WhatsApp requests, not stored reservations or payment confirmations; do not imply a message was sent automatically.
- Missing seasonal rates must yield on-request quotes rather than fabricated rates; calculate Easter dates each year.
- Photo cards reveal details through both pointer hover and accessible toggle controls so mobile users can reach the same content.
- Downloaded photos are referenced through asset pointers; generic location photography must be labeled illustrative and apartment/guide portraits remain placeholders until real photos are supplied.
