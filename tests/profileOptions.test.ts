import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  DEFAULT_PROFILE_REGION_CODE,
  formatPhoneForRegion,
  getProfileRegion,
} from '../src/data/profileOptions';

test('new profiles default to the United States calling code', () => {
  assert.equal(DEFAULT_PROFILE_REGION_CODE, 'US');
  assert.equal(getProfileRegion(DEFAULT_PROFILE_REGION_CODE).callingCode, '1');
});

test('the phone prefix follows the selected region without changing local digits', () => {
  const localNumber = '(415) 555-0100';
  assert.equal(formatPhoneForRegion(localNumber, 'US'), '+14155550100');
  assert.equal(formatPhoneForRegion(localNumber, 'GB'), '+444155550100');
});

test('regions without one calling code preserve the entered international number', () => {
  assert.equal(formatPhoneForRegion('+351 912 345 678', 'EU'), '+351 912 345 678');
});
