# TODO

## Source metadata review (from tg-nn, 2026-11-12)

tg-nn's `nn-db` on nyx got 437 bulk-imported sources (channels the collector accounts are members of) with placeholder values: destination = Test (`-1001391125365`), `is_active = false`, no display name, bias, rating or description. The new destination "IT is interesting" (`-1001369053241`, informatics/cyber/AI) and its 3 sources were added as well. See `tg-nn/todo.md`.

mix-sv is the natural place to do this review:

- [ ] Sync these sources and the new destination into mix-sv's database (it currently uses its own Neon DB, not `nn-db`), or point both at one database.
- [ ] Let editors assign each channel a proper default destination.
- [ ] Add better metadata fields to the channel edit form: factuality/reliability rating, political leaning, language, primary region/topic, description. Decide on the rating scale and add schema columns where `rating` alone is not enough.
- [ ] Show which sources still have placeholder data, so the review can be worked through as a queue.
