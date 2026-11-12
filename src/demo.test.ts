import { beforeEach, describe, expect, it } from 'vitest';
import { BEATS, STEPS, firstBeatOf } from './beats';
import { brownChannels, channelCounts, useDemo } from './store';
import { VENDORS, VENDOR_ORDER } from './vendors';
import scenario from './scenario/scenario.json';

beforeEach(() => useDemo.getState().reset());

describe('beat engine', () => {
  it('has seven steps and a beat per note', () => {
    expect(STEPS).toHaveLength(7);
    expect(BEATS).toHaveLength(STEPS.reduce((a, s) => a + s.notes.length, 0));
  });

  it('never moves past the first or last beat', () => {
    const s = useDemo.getState();
    s.prev();
    expect(useDemo.getState().beat).toBe(0);
    for (let i = 0; i < BEATS.length + 5; i++) useDemo.getState().next();
    expect(useDemo.getState().beat).toBe(BEATS.length - 1);
  });

  it('jumps to the first beat of a step and starts the timer', () => {
    useDemo.getState().jumpStep(3);
    const st = useDemo.getState();
    expect(st.beat).toBe(firstBeatOf(3));
    expect(BEATS[st.beat]).toMatchObject({ step: 3, local: 0 });
    expect(st.startedAt).not.toBeNull();
  });

  it('cycles through every vendor and back', () => {
    for (const id of VENDOR_ORDER.slice(1)) { useDemo.getState().cycleVendor(); expect(useDemo.getState().vendor).toBe(id); }
    useDemo.getState().cycleVendor();
    expect(useDemo.getState().vendor).toBe('neutral');
  });
});

describe('consent what-if', () => {
  it('only changes email reach', () => {
    const on = channelCounts(true), off = channelCounts(false);
    expect(on.email - off.email).toBe(1);
    expect({ ...off, email: on.email }).toEqual(on);
    expect(brownChannels(false)).toMatchObject({ email: false, crm: true, media: true, web: true });
  });

  it('segment funnel ends at 1,240 and channels never exceed it', () => {
    const rules = scenario.segment.rules;
    expect(rules[rules.length - 1][2]).toBe(1240);
    Object.values(channelCounts(true)).forEach(n => expect(n).toBeLessThanOrEqual(1240));
  });
});

describe('vendor packs', () => {
  it('fill every label for every vendor', () => {
    const keys = Object.keys(VENDORS.neutral).filter(k => !['partners', 'note'].includes(k));
    for (const id of VENDOR_ORDER) for (const k of keys) expect((VENDORS[id] as unknown as Record<string, unknown>)[k], `${id}.${k}`).toBeTruthy();
  });
});
