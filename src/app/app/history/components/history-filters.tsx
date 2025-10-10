'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Filter, RotateCcw } from 'lucide-react';
import { Tag, UserProfile } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { Spinner } from '@/components/ui/spinner';
import { TagBadge } from '@/components/tag-badge';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { type DateRange } from 'react-day-picker';
import { format } from 'date-fns';

interface HistoryFiltersProps {
  isAdmin: boolean;
  onFilterChange: (filters: FilterValues) => void;
  onClearFilters: () => void;
}

export interface FilterValues {
  officerIds: string[];
  startDate: string;
  endDate: string;
  tagIds: string[];
}

export function HistoryFilters({ isAdmin, onFilterChange, onClearFilters }: HistoryFiltersProps) {
  const [officers, setOfficers] = useState<UserProfile[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loadingOfficers, setLoadingOfficers] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);

  const [selectedOfficers, setSelectedOfficers] = useState<UserProfile[]>([]);
  const [officerSearch, setOfficerSearch] = useState('');
  const [showOfficerDropdown, setShowOfficerDropdown] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [tagSearch, setTagSearch] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  const officerDropdownRef = useRef<HTMLDivElement>(null);
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch officers (admin only)
  useEffect(() => {
    if (isAdmin) {
      fetchOfficers();
    }
  }, [isAdmin]);

  // Fetch tags
  useEffect(() => {
    fetchTags();
  }, []);

  // Click outside handler for officer dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (officerDropdownRef.current && !officerDropdownRef.current.contains(event.target as Node)) {
        setShowOfficerDropdown(false);
      }
    }

    if (showOfficerDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showOfficerDropdown]);

  // Click outside handler for tag dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
        setShowTagDropdown(false);
      }
    }

    if (showTagDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showTagDropdown]);

  const fetchOfficers = async () => {
    try {
      setLoadingOfficers(true);
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) return;

      const response = await fetch('/api/users/list', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOfficers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching officers:', error);
    } finally {
      setLoadingOfficers(false);
    }
  };

  const fetchTags = async () => {
    try {
      setLoadingTags(true);
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) return;

      const response = await fetch('/api/tags/list', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTags(data.tags || []);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoadingTags(false);
    }
  };

  const handleApplyFilters = () => {
    onFilterChange({
      officerIds: selectedOfficers.map(o => o.id),
      startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '',
      endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '',
      tagIds: selectedTags.map(t => t.id),
    });
  };

  const handleClearFilters = () => {
    setSelectedOfficers([]);
    setOfficerSearch('');
    setDateRange(undefined);
    setSelectedTags([]);
    setTagSearch('');
    onClearFilters();
  };

  const addOfficer = (officer: UserProfile) => {
    if (!selectedOfficers.find(o => o.id === officer.id)) {
      setSelectedOfficers([...selectedOfficers, officer]);
    }
    setOfficerSearch('');
    setShowOfficerDropdown(false);
  };

  const removeOfficer = (officerId: string) => {
    setSelectedOfficers(selectedOfficers.filter(o => o.id !== officerId));
  };

  const addTag = (tag: Tag) => {
    if (!selectedTags.find(t => t.id === tag.id)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setTagSearch('');
    setShowTagDropdown(false);
  };

  const removeTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter(t => t.id !== tagId));
  };

  const filteredOfficers = officers.filter(
    officer => {
      const searchText = (officer.full_name || officer.email).toLowerCase();
      return searchText.includes(officerSearch.toLowerCase()) &&
        !selectedOfficers.find(so => so.id === officer.id);
    }
  );

  const filteredTags = tags.filter(
    tag => tag.name.toLowerCase().includes(tagSearch.toLowerCase()) &&
    !selectedTags.find(st => st.id === tag.id)
  );

  const hasActiveFilters = selectedOfficers.length > 0 || dateRange?.from || selectedTags.length > 0;
  const activeFilterCount =
    (selectedOfficers.length > 0 ? 1 : 0) +
    (dateRange?.from || dateRange?.to ? 1 : 0) +
    (selectedTags.length > 0 ? 1 : 0);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Filters</h3>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFilterCount} active
                </Badge>
              )}
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-8 text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Officer Filter (Admin Only) */}
            {isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="officer-filter" className="text-xs font-medium">
                  Officers
                </Label>
                <div className="relative" ref={officerDropdownRef}>
                  <Input
                    id="officer-filter"
                    type="text"
                    placeholder={loadingOfficers ? "Loading..." : "Search officers..."}
                    value={officerSearch}
                    onChange={(e) => setOfficerSearch(e.target.value)}
                    onFocus={() => setShowOfficerDropdown(true)}
                    className="h-9"
                    disabled={loadingOfficers}
                  />
                  {/* Officer Dropdown */}
                  {showOfficerDropdown && officerSearch && (
                    <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto border rounded-md bg-popover shadow-md z-50">
                      {loadingOfficers ? (
                        <div className="p-3 flex items-center justify-center">
                          <Spinner size="sm" variant="muted" />
                        </div>
                      ) : filteredOfficers.length > 0 ? (
                        <div className="p-1">
                          {filteredOfficers.map((officer) => (
                            <button
                              key={officer.id}
                              type="button"
                              onClick={() => addOfficer(officer)}
                              className="w-full text-left px-3 py-2 hover:bg-accent rounded-sm text-sm transition-colors"
                            >
                              {officer.full_name || officer.email}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 text-sm text-muted-foreground text-center">
                          No officers found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Date Range Filter */}
            <div className="space-y-2 md:col-span-2">
              <Label className="text-xs font-medium">
                Date Range
              </Label>
              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                placeholder="Select date range"
                className="h-9"
                showPresets={true}
              />
            </div>

            {/* Tag Filter */}
            <div className="space-y-2">
              <Label htmlFor="tag-filter" className="text-xs font-medium">
                Tags
              </Label>
              <div className="relative" ref={tagDropdownRef}>
                <Input
                  id="tag-filter"
                  type="text"
                  placeholder={loadingTags ? "Loading..." : "Search tags..."}
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  onFocus={() => setShowTagDropdown(true)}
                  className="h-9"
                  disabled={loadingTags}
                />
                {/* Tag Dropdown */}
                {showTagDropdown && tagSearch && (
                  <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto border rounded-md bg-popover shadow-md z-50">
                    {loadingTags ? (
                      <div className="p-3 flex items-center justify-center">
                        <Spinner size="sm" variant="muted" />
                      </div>
                    ) : filteredTags.length > 0 ? (
                      <div className="p-1">
                        {filteredTags.map((tag) => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => addTag(tag)}
                            className="w-full text-left px-3 py-2 hover:bg-accent rounded-sm text-sm transition-colors flex items-center gap-2"
                          >
                            <TagBadge tag={tag} size="sm" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 text-sm text-muted-foreground text-center">
                        No tags found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Selected Officers */}
          {isAdmin && selectedOfficers.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                {selectedOfficers.length} officer{selectedOfficers.length !== 1 ? 's' : ''} selected
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedOfficers.map((officer) => (
                  <div key={officer.id} className="flex items-center gap-1 bg-primary/10 text-primary rounded-md px-2 py-1">
                    <span className="text-sm">{officer.full_name || officer.email}</span>
                    <button
                      type="button"
                      onClick={() => removeOfficer(officer.id)}
                      className="rounded-sm p-0.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {selectedTags.map((tag) => (
                <div key={tag.id} className="flex items-center gap-1">
                  <TagBadge tag={tag} size="sm" />
                  <button
                    type="button"
                    onClick={() => removeTag(tag.id)}
                    className="rounded-sm p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Apply Button */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleApplyFilters}
              size="sm"
              className="h-9"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
