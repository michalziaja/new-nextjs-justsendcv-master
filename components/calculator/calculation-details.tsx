import React from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import * as calc from './utils/types';
import { formatCurrency } from './utils/formatters';

interface CalculationDetailsProps {
    results: calc.CalculationResults;
    contractType: calc.UopContractType;
    options: calc.UopOptionsState;
}

export const CalculationDetails: React.FC<CalculationDetailsProps> = ({ results, contractType, options }) => {
    // Używamy obliczonego brutto do sprawdzenia
    if (results.grossAmount <= 0) {
        return null;
    }

    const costs = options.isOutsideCity ? 300 : 250;
    const taxBase = results.basis.taxBasis > 0 ? results.basis.taxBasis : 0;
    const taxBeforeRelief = Math.max(0, taxBase * 0.12);

    // Zamiana parseFloat na parseInt dla dzieloKoszty, jeśli jest stringiem
    const dzieloKosztyValue = typeof options.dzieloKoszty === 'string' ? parseInt(options.dzieloKoszty) : options.dzieloKoszty;

    return (
        <div className="border-0 h-[30px] pt-2">
            <Collapsible>
                <CollapsibleTrigger className="flex  items-center justify-between w-full">
                    <h3 className="text-base ml-4 font-semibold">Szczegóły obliczeń</h3>
                    <div className="text-xs mr-4 text-muted-foreground">(kliknij, aby rozwinąć)</div>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-2 mt-3 space-y-4 text-xs border-1 rounded-md shadow-inner max-h-[300px] overflow-y-auto pr-2 bg-gray-50">
                    {/* Informacja o kwocie brutto/netto */}
                    <div className="py-2 bg-muted/40 rounded-md px-3 text-sm">
                        {options.calcDirection === 'netto' ? (
                            <>
                                Kwota brutto dla <span className="font-medium">{formatCurrency(results.netAmount)}</span> netto, wynosi: <span className="font-medium">{formatCurrency(results.grossAmount)}</span>
                            </>
                        ) : (
                            <>
                                Kwota netto dla <span className="font-medium">{formatCurrency(results.grossAmount)}</span> brutto, wynosi: <span className="font-medium">{formatCurrency(results.netAmount)}</span>
                            </>
                        )}
                    </div>

                    {contractType === "pracaUop" && (
                        <>
                            <div className="space-y-1">
                                <p className="font-medium">Podstawa składek ZUS: {formatCurrency(results.basis.socialContributionsBasis)}</p>
                                <ul className="list-disc list-inside pl-2 text-muted-foreground">
                                    <li>Składka emerytalna (pracownik): {formatCurrency(results.employeeContributions.pension)} (9.76%)</li>
                                    <li>Składka rentowa (pracownik): {formatCurrency(results.employeeContributions.disability)} (1.5%)</li>
                                    <li>Składka chorobowa: {formatCurrency(results.employeeContributions.sickness)} (2.45%)</li>
                                    <li className="font-medium text-foreground">Suma składek pracownika: {formatCurrency(results.employeeContributions.pension + results.employeeContributions.disability + results.employeeContributions.sickness)}</li>
                                </ul>
                            </div>

                            <div className="space-y-1">
                                <p className="font-medium">Podstawa składki zdrowotnej: {formatCurrency(results.basis.healthContributionBasis)}</p>
                                <ul className="list-disc list-inside pl-2 text-muted-foreground">
                                    <li>Składka zdrowotna (9%): {formatCurrency(results.employeeContributions.health)}</li>
                                </ul>
                            </div>

                            <div className="space-y-1">
                                <p className="font-medium">Podstawa opodatkowania: {formatCurrency(taxBase)}</p>
                                <ul className="list-disc list-inside pl-2 text-muted-foreground">
                                    <li>Koszty uzyskania przychodu: {formatCurrency(costs)} ({options.isOutsideCity ? 'podwyższone' : 'standardowe'})</li>
                                    {options.age !== "under26" ? (
                                        <>
                                            <li>Podatek przed ulgami (12%): {formatCurrency(taxBeforeRelief)}</li>
                                            {options.isPit2 && <li>Kwota zmniejszająca podatek (PIT-2): -{formatCurrency(300)}</li>}
                                            {!options.isPit2 && <li>Brak kwoty zmniejszającej podatek (brak PIT-2)</li>}
                                            <li className="font-medium text-foreground">Zaliczka na podatek PIT: {formatCurrency(results.employeeContributions.tax)}</li>
                                        </>
                                    ) : (
                                        <li className="text-green-600 font-medium">Zerowy PIT dla młodych (wiek do 26 lat)</li>
                                    )}
                                </ul>
                            </div>

                            {options.uopPpk && results.employeeContributions.ppk !== undefined && results.employeeContributions.ppk > 0 && (
                                <div className="space-y-1">
                                    <p className="font-medium">PPK (Pracowniczy Plan Kapitałowy)</p>
                                    <ul className="list-disc list-inside pl-2 text-muted-foreground">
                                        <li>Składka pracownika ({options.uopPpkRate}%): {formatCurrency(results.employeeContributions.ppk || 0)}</li>
                                        <li>Składka pracodawcy (1.5%): {formatCurrency(results.employerContributions.ppk || 0)}</li>
                                    </ul>
                                </div>
                            )}

                            <div className="space-y-1">
                                <p className="font-medium">Składki pracodawcy</p>
                                <ul className="list-disc list-inside pl-2 text-muted-foreground">
                                    <li>Składka emerytalna: {formatCurrency(results.employerContributions.pension)} (9.76%)</li>
                                    <li>Składka rentowa: {formatCurrency(results.employerContributions.disability)} (6.5%)</li>
                                    <li>Składka wypadkowa: {formatCurrency(results.employerContributions.accident)} ({options.uopAccidentRate}%)</li>
                                    <li>Fundusz Pracy: {formatCurrency(results.employerContributions.fp)} (2.45%)</li>
                                    <li>FGŚP: {formatCurrency(results.employerContributions.fgsp)} (0.1%)</li>
                                    {options.uopPpk && results.employerContributions.ppk !== undefined && results.employerContributions.ppk > 0 && <li>Składka PPK: {formatCurrency(results.employerContributions.ppk || 0)} (1.5%)</li>}
                                    <li className="font-medium text-foreground">Suma składek pracodawcy: {formatCurrency(
                                        results.employerContributions.pension +
                                        results.employerContributions.disability +
                                        results.employerContributions.accident +
                                        results.employerContributions.fp +
                                        results.employerContributions.fgsp +
                                        (results.employerContributions.ppk || 0)
                                    )}</li>
                                    <h3 className="font-medium text-gray-800 -ml-2 mb-3 text-sm mt-3">Całkowity koszt pracodawcy: {formatCurrency(results.totalEmployerCost)}</h3>
                                </ul>
                            </div>
                        </>
                    )}

                    {contractType === "zlecenie" && (
                        <>
                            <div className="space-y-1">
                                <p className="font-medium">Podstawa składek ZUS: {formatCurrency(results.basis.socialContributionsBasis)}</p>
                                {options.zlecenieEmerytalne || options.zlecenieChorobowe ? (
                                    <ul className="list-disc list-inside pl-2 text-muted-foreground">
                                        {options.zlecenieEmerytalne && <>
                                            <li>Składka emerytalna (9.76%): {formatCurrency(results.employeeContributions.pension)}</li>
                                            <li>Składka rentowa (1.5%): {formatCurrency(results.employeeContributions.disability)}</li>
                                        </>}
                                        {options.zlecenieChorobowe && (
                                            <li>Składka chorobowa (2.45%): {formatCurrency(results.employeeContributions.sickness)}</li>
                                        )}
                                        <li className="font-medium text-foreground">Suma składek ZUS: {formatCurrency(results.employeeContributions.pension + results.employeeContributions.disability + results.employeeContributions.sickness)}</li>
                                    </ul>
                                ) : ( <p className="text-muted-foreground pl-2">Brak składek ZUS (nie zaznaczono)</p>)}
                            </div>

                            <div className="space-y-1">
                                <p className="font-medium">Podstawa składki zdrowotnej: {formatCurrency(results.basis.healthContributionBasis)}</p>
                                <ul className="list-disc list-inside pl-2 text-muted-foreground">
                                    <li>Składka zdrowotna (9%): {formatCurrency(results.employeeContributions.health)}</li>
                                </ul>
                            </div>

                            <div className="space-y-1">
                                <p className="font-medium">Podstawa opodatkowania: {formatCurrency(taxBase)}</p>
                                <ul className="list-disc list-inside pl-2 text-muted-foreground">
                                    <li>Koszty uzyskania przychodu (20%): {formatCurrency(results.grossAmount * 0.20)} (uproszczone)</li>
                                    {options.age !== "under26" ? (
                                        <>
                                            <li>Podatek przed ulgami (12%): {formatCurrency(taxBeforeRelief)}</li>
                                            {options.isPit2 && <li>Kwota zmniejszająca podatek (PIT-2): -{formatCurrency(300)}</li>}
                                            {!options.isPit2 && <li>Brak kwoty zmniejszającej podatek (brak PIT-2)</li>}
                                            <li className="font-medium text-foreground">Zaliczka na podatek PIT: {formatCurrency(results.employeeContributions.tax)}</li>
                                        </>
                                    ) : (
                                        <li className="text-green-600 font-medium">Zerowy PIT dla młodych (wiek do 26 lat)</li>
                                    )}
                                </ul>
                            </div>
                            <div className="font-semibold text-base mt-2">
                                Całkowity koszt zleceniodawcy: {formatCurrency(results.totalEmployerCost)}
                                <span className="text-xs font-normal text-muted-foreground"> (w tym modelu uproszczone - równe kwocie brutto)</span>
                            </div>
                        </>
                    )}

                    {contractType === "dzielo" && (
                        <>
                            <div className="space-y-1">
                                {options.dzieloSytuacja === "ta-sama-firma" ? (
                                    <p className="font-medium text-muted-foreground">Umowa o dzieło z własnym pracodawcą podlega składkom ZUS (emerytalna i rentowa) oraz zdrowotnej.</p>
                                ) : (
                                    <p className="font-medium text-muted-foreground">Umowa o dzieło standardowo nie podlega składkom ZUS ani zdrowotnej.</p>
                                )}
                            </div>

                            {/* Sekcja składek ZUS - tylko dla umowy z własnym pracodawcą */}
                            {options.dzieloSytuacja === "ta-sama-firma" && (
                                <div className="space-y-1">
                                    <p className="font-medium">Składki społeczne: {formatCurrency(results.employeeContributions.pension + results.employeeContributions.disability)}</p>
                                    <ul className="list-disc list-inside pl-2 text-muted-foreground">
                                        <li>Emerytalna (9,76%): {formatCurrency(results.employeeContributions.pension)}</li>
                                        <li>Rentowa (1,5%): {formatCurrency(results.employeeContributions.disability)}</li>
                                    </ul>
                                    <p className="font-medium">Składka zdrowotna (9%): {formatCurrency(results.employeeContributions.health)}</p>
                                </div>
                            )}

                            <div className="space-y-1">
                                <p className="font-medium">Podstawa opodatkowania: {formatCurrency(results.basis.taxBasis)}</p>
                                <ul className="list-disc list-inside pl-2 text-muted-foreground">
                                    {options.dzieloSytuacja === "ta-sama-firma" ? (
                                        <li>Koszty uzyskania przychodu ({options.dzieloKoszty}%) od kwoty po ZUS: {formatCurrency(results.basis.healthContributionBasis * dzieloKosztyValue / 100)}</li>
                                    ) : (
                                        <li>Koszty uzyskania przychodu ({options.dzieloKoszty}%): {formatCurrency(results.grossAmount * dzieloKosztyValue / 100)}</li>
                                    )}

                                    {options.age === "under26" && options.dzieloSytuacja === "student" ? (
                                        <li className="text-green-600 font-medium">Zerowy PIT dla uczniów/studentów do 26 lat</li>
                                    ) : options.age === "under26" ? (
                                        <li className="text-green-600 font-medium">Zerowy PIT dla młodych (wiek do 26 lat)</li>
                                    ) : (
                                        <>
                                            <li>Podatek przed ulgami (12%): {formatCurrency(results.basis.taxBasis * 0.12)}</li>
                                            {options.isPit2 && <li>Kwota zmniejszająca podatek (PIT-2): -{formatCurrency(300)}</li>}
                                            {!options.isPit2 && <li>Brak kwoty zmniejszającej podatek (brak PIT-2)</li>}
                                            <li className="font-medium text-foreground">Zaliczka na podatek PIT: {formatCurrency(results.employeeContributions.tax)}</li>
                                        </>
                                    )}
                                </ul>
                            </div>
                            <div className="font-semibold text-base mt-2">
                                Całkowity koszt zamawiającego: {formatCurrency(results.totalEmployerCost)}
                                <span className="text-xs font-normal text-muted-foreground"> (równe kwocie brutto)</span>
                            </div>
                        </>
                    )}
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}; 