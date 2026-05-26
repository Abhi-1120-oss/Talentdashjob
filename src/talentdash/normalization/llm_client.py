"""Async OpenAI client for normalization."""

import json

from openai import AsyncOpenAI
from pydantic import ValidationError

from talentdash.config import get_settings
from talentdash.normalization.llm_output_schema import LLMBatchResponse
from talentdash.normalization.prompts import SYSTEM_PROMPT, USER_PROMPT_TEMPLATE
from talentdash.observability import get_logger
from talentdash.validation.schemas import ExtractedRecord, LLMNormalizedRecord

log = get_logger(__name__)


class LLMNormalizerClient:
    def __init__(self) -> None:
        settings = get_settings()
        self._client = AsyncOpenAI(api_key=settings.openai_api_key or "sk-placeholder")
        self._model = settings.llm_model

    async def normalize_batch(self, records: list[ExtractedRecord]) -> list[LLMNormalizedRecord | None]:
        if not records:
            return []

        payload = [r.model_dump(mode="json") for r in records]
        user_prompt = USER_PROMPT_TEMPLATE.format(records_json=json.dumps(payload, default=str))

        try:
            response = await self._client.chat.completions.create(
                model=self._model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                response_format={"type": "json_object"},
                temperature=0.1,
            )
            content = response.choices[0].message.content or "{}"
            data = json.loads(content)

            if isinstance(data, dict) and "records" in data:
                batch = LLMBatchResponse.model_validate(data)
                return self._align_results(records, batch.records)
            if isinstance(data, list):
                validated = [LLMNormalizedRecord.model_validate(r) for r in data]
                return self._align_results(records, validated)

            single = LLMNormalizedRecord.model_validate(data)
            results: list[LLMNormalizedRecord | None] = [None] * len(records)
            if records:
                results[0] = single
            return results

        except (json.JSONDecodeError, ValidationError, Exception) as e:
            log.error("llm_batch_failed", error=str(e), count=len(records))
            return [None] * len(records)

    def _align_results(
        self,
        inputs: list[ExtractedRecord],
        outputs: list[LLMNormalizedRecord],
    ) -> list[LLMNormalizedRecord | None]:
        results: list[LLMNormalizedRecord | None] = []
        for i, inp in enumerate(inputs):
            if i < len(outputs):
                out = outputs[i]
                if not out.source_url and inp.source_url:
                    out = out.model_copy(update={"source_url": inp.source_url})
                if out.source != inp.source:
                    out = out.model_copy(update={"source": inp.source})
                results.append(out)
            else:
                results.append(None)
        return results

    async def normalize_single(self, record: ExtractedRecord) -> LLMNormalizedRecord | None:
        results = await self.normalize_batch([record])
        return results[0] if results else None
